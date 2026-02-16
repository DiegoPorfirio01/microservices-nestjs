import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { CircuitBreakerModule } from 'src/common/circuit-breaker/circuit-breaker.module';
import { CircuitBreakerService } from 'src/common/circuit-breaker/circuit-breaker.service';
import { ProxyService } from './service/proxy.service';

@Module({
  imports: [HttpModule, CircuitBreakerModule],
  providers: [ProxyService, CircuitBreakerService],
  exports: [ProxyService],
})
export class ProxyModule {}
