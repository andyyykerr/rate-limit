import { RateLimitTestExtension } from '../index';

describe('setConfig', () => {
  test('can set instance config', () => {
    const maxCalls = 10;
    const periodMs = 1000;
    const rateLimit = new RateLimitTestExtension({ maxCalls, periodMs });

    const setMaxCalls = 20;
    const setPeriodMs = 2000;
    const result = rateLimit.setConfig({ maxCalls: setMaxCalls, periodMs: setPeriodMs });

    expect(result.maxCalls).toBe(setMaxCalls);
    expect(result.periodMs).toBe(setPeriodMs);
  });
});
