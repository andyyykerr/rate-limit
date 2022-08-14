import { RateLimitTestExtension } from '../index';

describe('getConfig', () => {
  test('can get instance config', () => {
    const maxCalls = 10;
    const periodMs = 500;
    const rateLimit = new RateLimitTestExtension({ maxCalls, periodMs });

    const result = rateLimit.getConfig();

    expect(result.maxCalls).toBe(maxCalls);
    expect(result.periodMs).toBe(periodMs);
  });
});
