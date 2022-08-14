import { RateLimitTestExtension } from '../index';

describe('removeConsumerExpiredCalls', () => {
  test('removes expired calls after period', async () => {
    const maxCalls = 5;
    const periodMs = 1000;
    const consumerId = 'someId';
    const now = Date.now();
    const rateLimit = new RateLimitTestExtension({ maxCalls, periodMs });

    [...Array(5).keys()].map(() => rateLimit.call({ consumerId, now }));
    let result = rateLimit.getConsumerCalls()[consumerId];

    expect(result).toHaveLength(5);

    rateLimit._removeConsumerExpiredCalls({ consumerId, now: now + periodMs });
    result = rateLimit.getConsumerCalls()[consumerId];

    expect(result).toHaveLength(0);
  });
});
