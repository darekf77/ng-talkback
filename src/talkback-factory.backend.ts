import Options from './options.backend';
import TapeStore from './tape-store.backend';
import TalkbackServer from './server.backend';
import RequestHandler from './request-handler.backend';

export default class TalkbackFactory {
  static server(options: Partial<Options>) {
    const fullOptions = Options.prepare(options)
    return new TalkbackServer(fullOptions)
  }

  static async requestHandler(options: Partial<Options>) {
    const fullOptions = Options.prepare(options)
    const tapeStore = new TapeStore(fullOptions)
    await tapeStore.load()
    return new RequestHandler(tapeStore, fullOptions)
  }
}
