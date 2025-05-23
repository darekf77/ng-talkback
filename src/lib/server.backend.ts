import RequestHandler from './request-handler.backend';
import Summary from './summary.backend';
import TapeStore from './tape-store.backend';
import * as http from 'http';
import { https, fse } from 'tnp-core/src';
import { Options } from './options.backend';
import { Req } from './types.backend';

export default class TalkbackServer {
  private readonly options: Options
  readonly tapeStore: TapeStore
  private requestHandler: RequestHandler
  private readonly closeSignalHandler?: (...args: any[]) => void
  private server?: http.Server
  private closed: boolean = false

  constructor(options: Options) {
    this.options = options
    this.tapeStore = new TapeStore(this.options)
    this.requestHandler = new RequestHandler(this.tapeStore, this.options)

    this.closeSignalHandler = this.close.bind(this)
  }

  handleRequest(rawReq: http.IncomingMessage, res: http.ServerResponse) {
    // console.log(`rawReq: ${rawReq.url}`)
    let reqBody = [] as Uint8Array[]
    rawReq.on("data", (chunk) => {
      reqBody.push(chunk)
    }).on("end", async () => {
      try {
        const req: Req = {
          headers: rawReq.headers,
          url: rawReq.url,
          method: rawReq.method,
          body: Buffer.concat(reqBody)
        }
        const fRes = await this.requestHandler.handle(req)

        res.writeHead(fRes.status, fRes.headers)
        res.end(fRes.body)
      } catch (ex) {
        console.error("Error handling request", ex)
        res.statusCode = 500
        res.end()
      }
    })
  }

  async start(callback?: () => void) {
    await this.tapeStore.load()
    const handleRequest = this.handleRequest.bind(this)

    const serverFactory = this.options.https.enabled ? () => {
      const httpsOpts = {
        key: fse.readFileSync(this.options.https.keyPath!),
        cert: fse.readFileSync(this.options.https.certPath!)
      }
      return https.createServer(httpsOpts, handleRequest)
    } : () => http.createServer(handleRequest)

    this.server = serverFactory()
    console.log(`Starting talkback on ${this.options.port}`)
    this.server.listen(this.options.port, callback)

    process.on("exit", this.closeSignalHandler as any)
    process.on("SIGINT", this.closeSignalHandler as any)
    process.on("SIGTERM", this.closeSignalHandler as any)

    return this.server
  }

  hasTapeBeenUsed(tapeName: string) {
    return this.tapeStore.hasTapeBeenUsed(tapeName)
  }

  resetTapeUsage() {
    this.tapeStore.resetTapeUsage()
  }

  close(callback?: () => void) {
    if (this.closed) {
      return
    }
    this.closed = true
    this.server!.close(callback)

    // @ts-ignore
    process.removeListener("exit", this.closeSignalHandler as any)
    // @ts-ignore
    process.removeListener("SIGINT", this.closeSignalHandler as any)
    // @ts-ignore
    process.removeListener("SIGTERM", this.closeSignalHandler as any)

    if (this.options.summary) {
      const summary = new Summary(this.tapeStore.tapes, this.options)
      summary.print()
    }
  }
}
