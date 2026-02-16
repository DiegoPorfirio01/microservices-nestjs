import { Injectable, Logger } from '@nestjs/common';
import {
  CircuitBreakerOptions,
  CircuitBreakerResult,
  CircuitBreakerState,
  CircuitBreakerStateEnum,
} from './circuite-breaker.interface';

@Injectable()
export class CircuitBreakerService {
  private readonly logger = new Logger('CircuitBreaker');
  private readonly circuitBreakerMap = new Map<string, CircuitBreakerState>();
  private readonly defaultOptions: CircuitBreakerOptions = {
    failureThreshold: 5,
    timeout: 60000,
    resetTimeout: 30000,
  };

  async executeWithCircuitBreaker<T>(
    operation: () => Promise<T>,
    fallback: () => Promise<T>,
    key: string,
    options?: Partial<CircuitBreakerOptions>,
  ): Promise<CircuitBreakerResult<T>> {
    const config = { ...this.defaultOptions, ...options };
    const circuit = this.getOrCreateCircuitBreaker(key, config);

    if (circuit.state === CircuitBreakerStateEnum.OPEN) {
      if (Date.now() < circuit.nextAttemptTime) {
        this.logger.warn(`Circuit breaker is open for key: ${key}`);

        if (fallback) {
          return await fallback();
        }

        throw new Error('Circuit breaker is open');
      }

      circuit.state = CircuitBreakerStateEnum.HALF_OPEN;
      this.logger.warn(`Circuit breaker is half open for key: ${key}`);
    }

    try {
      const result = await operation();
      this.onSuccess(circuit, key);
      return result;
    } catch (error) {
      this.onFailure(circuit, key, config);
      this.logger.error(`Circuit breaker operation failed for key: ${key}`);
      if (fallback) {
        this.logger.log(`Fallback executed for key: ${key}`);
        return await fallback();
      }
      throw error;
    }
  }

  private getOrCreateCircuitBreaker(
    key: string,
    options: CircuitBreakerOptions,
  ): CircuitBreakerState {
    if (!this.circuitBreakerMap.has(key)) {
      this.circuitBreakerMap.set(key, {
        state: CircuitBreakerStateEnum.CLOSE,
        failureCount: 0,
        lastFailureTime: 0,
        nextAttemptTime: Date.now() + options.timeout,
      });
    }

    return this.circuitBreakerMap.get(key)!;
  }

  private onFailure(
    circuit: CircuitBreakerState,
    key: string,
    options: CircuitBreakerOptions,
  ) {
    circuit.failureCount++;
    circuit.lastFailureTime = Date.now();
    if (circuit.failureCount >= options.failureThreshold)
      circuit.state = CircuitBreakerStateEnum.OPEN;
    circuit.nextAttemptTime = Date.now() + options.resetTimeout;

    this.logger.warn(
      `Circuit breaker is open for key: ${key} after ${circuit.failureCount} failures`,
    );
  }

  private onSuccess(circuit: CircuitBreakerState, key: string): void {
    circuit.failureCount = 0;
    circuit.state = CircuitBreakerStateEnum.CLOSE;
    this.logger.debug(`Circuit breaker is closed for key: ${key}`);
  }

  getCircuitState(key: string): CircuitBreakerStateEnum {
    return (
      this.circuitBreakerMap.get(key)?.state || CircuitBreakerStateEnum.CLOSE
    );
  }

  getAllCircuits(): Map<string, CircuitBreakerState> {
    return new Map(this.circuitBreakerMap);
  }

  resetCircuit(key: string): void {
    this.circuitBreakerMap.delete(key);
    this.logger.log(`Circuit breaker reset for key: ${key}`);
  }
}
