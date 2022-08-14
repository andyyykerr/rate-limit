type ConsumerId = string;

type LogMethod = (message: string, ...data: unknown[]) => void;

interface ConsumerCalls {
  [name: ConsumerId]: number[];
}

type AvailableResponse = null;

interface UnavailableResponse {
  availableIn: number;
  availableAt: Date;
}

interface RateLimitConfig {
  maxCalls?: number;
  periodMs?: number;
  log?: LogMethod;
}

class RateLimit {
  private maxCalls: number; // max calls allowed per periodMs
  private periodMs: number; // given time period in milliseconds
  private log: LogMethod; // log function for external logging

  private consumerCalls: ConsumerCalls; // map of call timestamps for each consumer

  constructor({ maxCalls = 10, periodMs = 1000, log = () => undefined }: RateLimitConfig) {
    this.validateConfig({ maxCalls, periodMs, log });

    this.maxCalls = maxCalls;
    this.periodMs = periodMs;
    this.log = log;

    this.consumerCalls = {};
  }

  protected validateConfig({ maxCalls, periodMs }: RateLimitConfig) {
    if (maxCalls < 1) {
      throw new Error('RateLimit invalid maxCalls');
    }

    if (periodMs < 1) {
      throw new Error('RateLimit invalid periodMs');
    }
  }

  protected addNewConsumer({ consumerId, now }: { consumerId: ConsumerId; now: number }) {
    this.consumerCalls[consumerId] = [now];
  }

  protected removeConsumerExpiredCalls({ consumerId, now }: { consumerId: ConsumerId; now: number }) {
    for (let i = this.consumerCalls[consumerId].length - 1; i > -1; i--) {
      if (now - this.consumerCalls[consumerId][i] >= this.periodMs) {
        this.consumerCalls[consumerId].splice(i, 1);
      }
    }
  }

  protected getConsumerAvailableIn({ consumerId, now }: { consumerId: ConsumerId; now: number }) {
    if (this.consumerCalls[consumerId].length === 0) {
      return 0;
    }

    return Math.abs(now - this.periodMs - this.consumerCalls[consumerId][0]);
  }

  protected getConsumerAvailableAt({ consumerId, now }: { consumerId: ConsumerId; now: number }) {
    if (this.consumerCalls[consumerId].length === 0) {
      return new Date(now);
    }

    return new Date(now + Math.abs(now - this.periodMs - this.consumerCalls[consumerId][0]));
  }

  getConfig() {
    return {
      maxCalls: this.maxCalls,
      periodMs: this.periodMs,
      log: this.log,
    };
  }

  setConfig({ maxCalls, periodMs, log }: RateLimitConfig) {
    this.maxCalls = maxCalls || this.maxCalls;
    this.periodMs = periodMs || this.periodMs;
    this.log = log || this.log;

    return this.getConfig();
  }

  getConsumerCalls() {
    return this.consumerCalls;
  }

  call({ consumerId, now = Date.now() }: { consumerId: ConsumerId; now?: number }): AvailableResponse | UnavailableResponse {
    // if new consumer, just timestamp the call and return available
    if (!this.consumerCalls[consumerId]) {
      this.addNewConsumer({ consumerId, now });
      return null;
    }

    // remove any call timestamps that are still within the time period
    this.removeConsumerExpiredCalls({ consumerId, now });

    // if consumer has reached the max calls per time period, return unavailable response
    if (this.consumerCalls[consumerId].length === this.maxCalls) {
      const availableIn = this.getConsumerAvailableIn({ consumerId, now });
      const availableAt = this.getConsumerAvailableAt({ consumerId, now });

      return { availableIn, availableAt };
    }

    // else timestamp the call and return available
    this.consumerCalls[consumerId].push(now);
    return null;
  }
}

export class RateLimitTestExtension extends RateLimit {
  constructor({ maxCalls, periodMs, log }: RateLimitConfig) {
    super({ maxCalls, periodMs, log });
  }

  _validateConfig = this.validateConfig;
  _addNewConsumer = this.addNewConsumer;
  _removeConsumerExpiredCalls = this.removeConsumerExpiredCalls;
  _getConsumerAvailableIn = this.getConsumerAvailableIn;
  _getConsumerAvailableAt = this.getConsumerAvailableAt;
}

export default RateLimit;
