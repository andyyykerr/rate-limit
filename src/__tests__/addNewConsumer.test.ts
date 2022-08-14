import { RateLimitTestExtension } from '../index';

describe('addNewConsumer', () => {
  test('add new consumer when called for the first time', () => {
    const consumerId = 'someId!';
    const now = Date.now();
    const rateLimit = new RateLimitTestExtension({});

    rateLimit.call({ consumerId, now }); // call to reach limit
    const result = rateLimit.getConsumerCalls();

    expect(result).toMatchObject({ [consumerId]: [now] });
  });
});
