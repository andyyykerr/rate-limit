import { RateLimitTestExtension } from '../index';

describe('getConsumerAvailableIn', () => {
  test('returns the correct availableIn time after limit reached', () => {
    const periodMs = 1000;
    const consumerId = 'someConsumerId!';
    const now = Date.now();
    const rateLimit = new RateLimitTestExtension({ maxCalls: 1, periodMs });

    rateLimit.call({ consumerId, now }); // call to reach limit
    const result = rateLimit.call({ consumerId, now });

    expect(result).toHaveProperty('availableIn', periodMs);
  });
});
