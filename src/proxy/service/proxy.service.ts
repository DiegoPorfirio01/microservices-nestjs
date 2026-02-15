import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { serviceConfig } from 'src/config/gateway.config';

@Injectable()
export class ProxyService {
  private readonly logger = new Logger(ProxyService.name);

  constructor(private readonly httpService: HttpService) {}

  async proxyRequest(
    serviceName: keyof typeof serviceConfig,
    method: string,
    path: string,
    data?: any,
    headers?: any,
    userInfo?: any,
  ) {
    const service = serviceConfig[serviceName];
    const url = `${service.url}${path}`;

    this.logger.log(`Proxying ${method} request to ${serviceName}: ${url}`);

    try {
      const enhancedHeaders = {
        ...headers,
        'x-user-id': userInfo?.userId,
        'x-user-email': userInfo?.email,
        'x-user-role': userInfo?.role,
      };

      const response = await firstValueFrom(
        this.httpService.request({
          method: method.toLowerCase() as any,
          url,
          data,
          headers: enhancedHeaders,
          timeout: service.timeout,
        }),
      );

      return response;
    } catch (error) {
      this.logger.error(
        `Error proxying ${method} request to ${serviceName}: ${url}`,
      );

      throw error;
    }
  }

  async getServiceHealth(serviceName: keyof typeof serviceConfig) {
    try {
      const service = serviceConfig[serviceName];
      const response = await firstValueFrom(
        this.httpService.get(`${service.url}/health`, {
          timeout: 3000,
          headers: {
            'X-Health-Check': 'simple',
          },
        }),
      );

      const healthData = response.data;
      const serviceStatus = healthData?.status || 'ok';

      return {
        status: 'healthy',
        data: {
          status: serviceStatus,
          timestamp: healthData?.timestamp || new Date().toISOString(),
        },
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      return { status: 'unhealthy', error: errorMessage };
    }
  }
}
