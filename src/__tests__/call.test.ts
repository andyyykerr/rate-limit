import { RateLimitTestExtension } from '../index';

describe('call', () => {
  const maxCalls = 10;
  const periodMs = 1000;
  const consumerId = 'someConsumerId#';
  const rateLimit = new RateLimitTestExtension({ maxCalls, periodMs });

  test('first call should timestamp the call and return available', () => {
    const callResult = rateLimit.call({ consumerId });
    expect(callResult).toBe(null);

    const callsResult = rateLimit.getConsumerCalls()[consumerId];
    expect(callsResult).toHaveLength(1);
  });

  test('second call should timestamp the call and return available', () => {
    const callResult = rateLimit.call({ consumerId });
    expect(callResult).toBe(null);

    const callsResult = rateLimit.getConsumerCalls()[consumerId];
    expect(callsResult).toHaveLength(2);
  });

  test('should return unavailable response when limit reached', () => {
    [...Array(8).keys()].map(() => rateLimit.call({ consumerId })); //iterate to reach limit

    const callResult = rateLimit.call({ consumerId });
    expect(callResult).toHaveProperty('availableIn');
    expect(callResult).toHaveProperty('availableAt');

    const callsResult = rateLimit.getConsumerCalls()[consumerId];
    expect(callsResult).toHaveLength(10);
  });

  test('should return unavailable response due to period not elasped', async () => {
    await new Promise((resolve) => setTimeout(resolve, periodMs / 2));

    const result = rateLimit.call({ consumerId });
    expect(result).toHaveProperty('availableIn');
    expect(result).toHaveProperty('availableAt');
  });

  test('should return available response due to period elasped', async () => {
    await new Promise((resolve) => setTimeout(resolve, periodMs));

    const result = rateLimit.call({ consumerId });
    expect(result).toBe(null);
  });
});
