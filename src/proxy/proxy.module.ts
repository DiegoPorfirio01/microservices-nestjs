import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { CircuitBreakerModule } from 'src/common/circuit-breaker/circuit-breaker.module';
import { CircuitBreakerService } from 'src/common/circuit-breaker/circuit-breaker.service';
import { CacheFallbackService } from 'src/common/fallback/cache.fallback';
import { DefaultFallbackService } from 'src/common/fallback/default.fallback';
import { ProxyService } from './service/proxy.service';

@Module({
  imports: [HttpModule, CircuitBreakerModule],
  providers: [
    ProxyService,
    CircuitBreakerService,
    CacheFallbackService,
    DefaultFallbackService,
  ],
  exports: [ProxyService],
})
export class ProxyModule {}
