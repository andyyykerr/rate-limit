/* eslint-disable no-console */
import RateLimit from './index';

const rateLimit = new RateLimit({ maxCalls: 10, periodMs: 1000, log: console.log });

(async () => {
  for await (const i of [...Array(100).keys()]) {
    const call = rateLimit.call({ consumerId: 'testConsumer' });

    if (!call) {
      console.log(`call ${i} ok`);
    } else {
      console.log(`call ${i} blocked ${call.availableIn} milliseconds until ${call.availableAt.toUTCString()}`);
    }

    await new Promise<void>((resolve) => setTimeout(() => resolve(), 99));
  }
})();
