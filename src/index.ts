export type Dummy = 'a';
let a = 2;
a++;
//#region @backend
export * from './options.backend';
export * from './tape.backend';


import TalkbackFactory from './talkback-factory.backend'
import Options, { DefaultOptions, FallbackMode, RecordMode } from './options.backend'


const talkbackFn = (options: Partial<Options>) => {
  return TalkbackFactory.server(options)
}

talkbackFn.Options = {
  Default: DefaultOptions,
  FallbackMode,
  RecordMode
}

talkbackFn.requestHandler = (options: Partial<Options>) => TalkbackFactory.requestHandler(options)

export const talkback = talkbackFn;
export default talkbackFn;
//#endregion
