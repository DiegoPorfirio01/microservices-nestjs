import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { CircuitBreakerModule } from 'src/common/circuite-breaker/circuite-breaker.module';
import { ProxyService } from './service/proxy.service';

@Module({
  imports: [HttpModule, CircuitBreakerModule],
  providers: [ProxyService],
  exports: [ProxyService],
})
export class ProxyModule {}
