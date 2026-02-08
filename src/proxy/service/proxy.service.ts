import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { firstValueFrom } from 'rxjs';
import { serviceConfig } from 'src/config/gateway.config';

interface UserInfo {
  userId?: string;
  email?: string;
  role?: string;
}

interface HttpHeaders {
  [key: string]: string | undefined;
}

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy';
  data?: unknown;
  error?: string;
}

@Injectable()
export class ProxyService {
  private readonly logger = new Logger(ProxyService.name);

  constructor(private readonly httpService: HttpService) {}

  async proxyRequest(
    serviceName: keyof typeof serviceConfig,
    method: string,
    path: string,
    data?: unknown,
    headers?: HttpHeaders,
    userInfo?: UserInfo,
  ): Promise<AxiosResponse> {
    const service = serviceConfig[serviceName];
    const url = `${service.url}${path}`;

    this.logger.log(`Proxying ${method} request to ${serviceName}: ${url}`);

    try {
      const enhancedHeaders: HttpHeaders = {
        ...headers,
        'x-user-id': userInfo?.userId,
        'x-user-email': userInfo?.email,
        'x-user-role': userInfo?.role,
      };

      const requestConfig: AxiosRequestConfig = {
        method: method.toUpperCase() as HttpMethod,
        url,
        data,
        headers: enhancedHeaders,
        timeout: service.timeout,
      };

      const response = await firstValueFrom(
        this.httpService.request(requestConfig),
      );

      return response;
    } catch (error: unknown) {
      this.logger.error(
        `Error proxying ${method} request to ${serviceName}: ${url}`,
      );

      throw error;
    }
  }

  async getServiceHealth(
    serviceName: keyof typeof serviceConfig,
  ): Promise<HealthCheckResponse> {
    try {
      const service = serviceConfig[serviceName];
      const response = await firstValueFrom(
        this.httpService.get(`${service.url}/health`, {
          timeout: 3000,
        }),
      );
      return { status: 'healthy', data: response.data };
    } catch (error) {
      return { status: 'unhealthy', error: error.message };
    }
  }
}
