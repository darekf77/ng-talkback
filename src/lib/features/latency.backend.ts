import OptionsFactory, {Options} from '../options.backend';
import {Req} from '../types.backend';
import Tape from '../tape.backend';

export default class Latency {
  private options
    : Options

  constructor(options: Options) {
    this.options = options
  }

  async simulate(req: Req, tape?: Tape) {
    const resolved = Promise.resolve()

    const latencyGenerator = tape && tape.meta.latency !== undefined ? tape.meta.latency : this.options.latency
    if (!latencyGenerator) {
      return resolved
    }

    OptionsFactory.validateLatency(latencyGenerator)

    let latency = 0

    const type = typeof latencyGenerator
    if (type === "number") {
      latency = latencyGenerator as number
    } else if (Array.isArray(latencyGenerator)) {
      const high = latencyGenerator[1]
      const low = latencyGenerator[0]
      latency = Math.random() * (high - low) + low
    } else {
      latency = (latencyGenerator as (_: Req) => number)(req)
    }

    return new Promise(r => setTimeout(r, latency))
  }
}
