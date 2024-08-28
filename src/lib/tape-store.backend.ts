import { Options } from './options.backend';
import { fse, path, json5, mkdirp } from 'tnp-core/src';

import Tape from './tape.backend';
import TapeMatcher from './tape-matcher.backend';
import TapeRenderer from './tape-renderer.backend';

export default class TapeStore {
  private readonly path: string
  private readonly options: Options
  tapes: Tape[]

  constructor(options: Options) {
    this.path = path.normalize(options.path + "/")
    this.options = options
    this.tapes = []
  }

  async load() {
    mkdirp.sync(this.path)

    await this.loadTapesAtDir(this.path)
    console.log(`Loaded ${this.tapes.length} tapes`)
  }

  async loadTapesAtDir(directory: string) {
    const items = fse.readdirSync(directory) as string[]
    for (let i = 0; i < items.length; i++) {
      const filename = items[i]
      const fullPath = `${directory}${filename}`
      const stat = fse.statSync(fullPath)
      if (!stat.isDirectory()) {
        try {
          const data = fse.readFileSync(fullPath, "utf8")
          const raw = json5.parse(data)
          const tape = await Tape.fromStore(raw, this.options)
          tape.path = filename
          this.tapes.push(tape)
        } catch (e) {
          console.log(`Error reading tape ${fullPath}`, e.message)
        }
      } else {
        this.loadTapesAtDir(fullPath + "/")
      }
    }
  }

  find(newTape: Tape) {
    const foundTape = this.tapes.find(t => {
      this.options.logger.debug(`Comparing against tape ${t.path}`)
      return new TapeMatcher(t, this.options).sameAs(newTape)
    })

    if (foundTape) {
      foundTape.used = true
      this.options.logger.log(`Found matching tape for ${newTape.req.url} at ${foundTape.path}`)
      return foundTape
    }
  }

  async save(tape: Tape) {
    tape.new = true
    tape.used = true

    const tapePath = tape.path
    let fullFilename

    if (tapePath) {
      fullFilename = path.join(this.path, tapePath)
    } else {
      // If the tape doesn't have a path then it's new
      this.tapes.push(tape)

      fullFilename = this.createTapePath(tape)
      tape.path = path.relative(this.path, fullFilename)
    }
    this.options.logger.log(`Saving request ${tape.req.url} at ${tape.path}`)

    const tapeRenderer = new TapeRenderer(tape)
    const toSave = await tapeRenderer.render()
    fse.writeFileSync(fullFilename, json5.stringify(toSave, null, 4))
  }

  currentTapeId() {
    return this.tapes.length
  }

  hasTapeBeenUsed(tapeName: string) {
    return this.tapes.some(t => t.used && t.path === tapeName)
  }

  resetTapeUsage() {
    return this.tapes.forEach(t => t.used = false)
  }

  createTapePath(tape: Tape) {
    const currentTapeId = this.currentTapeId()
    let tapePath = `unnamed-${currentTapeId}.json5`
    if (this.options.tapeNameGenerator) {
      tapePath = this.options.tapeNameGenerator(currentTapeId, tape)
    }
    let result = path.normalize(path.join(this.options.path, tapePath))
    if (!result.endsWith(".json5")) {
      result = `${result}.json5`
    }
    const dir = path.dirname(result)
    mkdirp.sync(dir)

    return result
  }
}
