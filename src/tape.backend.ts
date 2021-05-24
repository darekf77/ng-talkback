import MediaType from './utils/media-type.backend';
import TapeRenderer from './tape-renderer.backend';
import ContentEncoding from './utils/content-encoding.backend';
import { Options } from './options.backend';
import { Metadata, Req, Res } from './types.backend';
import* as URL from 'url';
import * as querystring from 'querystring';
// const URL = require('url')
// const querystring = require('querystring')

export class Tape {
  req: Req
  res?: Res
  options: Options
  queryParamsToIgnore: string[]
  meta: Metadata
  path?: string

  new: boolean = false
  used: boolean = false

  constructor(req: Req, options: Options) {
    this.req = { ...req }
    this.options = options

    // This needs to happen before we erase headers since we could lose information
    this.normalizeBody()

    this.cleanupHeaders()

    this.queryParamsToIgnore = this.options.ignoreQueryParams
    this.cleanupQueryParams()


    this.meta = {
      createdAt: new Date(),
      host: this.options.host
    }
  }

  static async fromStore(raw: any, options: Options) {
    return TapeRenderer.fromStore(raw, options)
  }

  cleanupHeaders() {
    const newHeaders = { ...this.req.headers }
    this.options.ignoreHeaders.forEach(h => delete newHeaders[h])
    this.req = {
      ...this.req,
      headers: newHeaders
    }
  }

  cleanupQueryParams() {
    if (this.queryParamsToIgnore.length === 0) {
      return
    }

    const url = URL.parse(this.req.url, true)
    if (!url.search) {
      return
    }

    const query = { ...url.query }
    this.queryParamsToIgnore.forEach(q => delete query[q])

    const newQuery = querystring.stringify(query)
    if (newQuery) {
      url.query = query
      url.search = "?" + newQuery
    } else {
      url.query = null
      url.search = null
    }
    this.req.url = URL.format(url)
  }

  normalizeBody() {
    const mediaType = new MediaType(this.req)
    const contentEncoding = new ContentEncoding(this.req)
    if (contentEncoding.isUncompressed() && mediaType.isJSON() && this.req.body.length > 0) {
      this.req.body = Buffer.from(JSON.stringify(JSON.parse(this.req.body.toString()), null, 2))
    }
  }

  async clone() {
    const tapeRenderer = new TapeRenderer(this)
    const raw = await tapeRenderer.render()
    return Tape.fromStore(raw, this.options)
  }
}

export default Tape;
