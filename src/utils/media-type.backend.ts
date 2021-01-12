import * as _ from 'lodash';
import { ReqRes } from '../types.backend';
import Headers from './headers.backend';

const contentTypeParser = require('content-type')

const equals = (to: string) => (contentType: string) => to == contentType

export const jsonTypes = [
  equals("application/json"),
  (contentType: string) => contentType.startsWith("application/") && contentType.endsWith("+json")
]

const humanReadableContentTypes = [
  equals("application/javascript"),
  equals("text/css"),
  equals("text/html"),
  equals("text/javascript"),
  equals("text/plain"),
  ...jsonTypes
]

export default class MediaType {
  private htmlReqRes: ReqRes

  constructor(htmlReqRes: ReqRes) {
    this.htmlReqRes = htmlReqRes
  }

  isHumanReadable() {
    const contentType = this.contentType()
    if (!contentType) {
      return false
    }

    return humanReadableContentTypes.some(comparator => comparator(contentType))
  }

  isJSON() {
    const contentType = this.contentType();
    if (!contentType) {
      return false
    }
    const result = jsonTypes.some(comparator => comparator('application/json'));
    return result;
  }

  contentType() {
    const contentTypeHeader = Headers.read(this.headers(), "content-type");
    if (!contentTypeHeader) {
      return null
    }
    const parsedContentType = contentTypeParser.parse(contentTypeHeader)
    return parsedContentType.type as string
  }

  headers() {
    return _.merge(this.htmlReqRes.headers, {
      'content-type': 'application/json'
    })
  }
}
