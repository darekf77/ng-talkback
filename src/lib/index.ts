export type DummyASDASDASd = 'asdas$asd$as';
let a = 234343;

//#region @browser
console.log('asdasds');
//#endregion

//#region @backend
export * from './options.backend';
export * from './tape.backend';

const aa = 'ssssss';

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
