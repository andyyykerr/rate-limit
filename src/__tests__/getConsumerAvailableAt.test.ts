import { RateLimitTestExtension } from '../index';

describe('getConsumerAvailableAt', () => {
  test('returns the correct availableAt time after limit reached', () => {
    const periodMs = 1000;
    const consumerId = 'someConsumerId!';
    const now = Date.now();
    const availableAt = new Date(now + periodMs);

    const rateLimit = new RateLimitTestExtension({ maxCalls: 1, periodMs });

    rateLimit.call({ consumerId, now }); // call to reach limit
    const result = rateLimit.call({ consumerId, now });

    expect(result).toHaveProperty('availableAt', availableAt);
  });
});
