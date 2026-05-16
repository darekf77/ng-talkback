export type DummyASDASDASd = 'a';
let a = 234343;
a++;

//#region @browser
console.log('sdasdasd');
//#endregion

//#region @backend
export * from './options.backend';
export * from './tape.backend';

a++;

import TalkbackFactory from './talkback-factory.backend';
import Options, {
  DefaultOptions,
  FallbackMode,
  RecordMode,
} from './options.backend';

const talkbackFn = (options: Partial<Options>) => {
  return TalkbackFactory.server(options);
};

talkbackFn.Options = {
  Default: DefaultOptions,
  FallbackMode,
  RecordMode,
};

talkbackFn.requestHandler = (options: Partial<Options>) =>
  TalkbackFactory.requestHandler(options);

export const talkback = talkbackFn;
export default talkbackFn;
//#endregion
