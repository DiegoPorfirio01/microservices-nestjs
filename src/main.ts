import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "'data:'", "'https:'"],
        },
      },
      crossOriginEmbedderPolicy: false,
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
    }),
  );

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      const allowedOrigins = process.env.CORS_ORIGIN?.split(',') || ['*'];

      if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin',
      'Access-Control-Request-Method',
      'Access-Control-Request-Headers',
    ],
    credentials: true,
    maxAge: 86400, // 24 hours
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Marketplace API Gateway')
    .setDescription(
      `
      API Gateway for Marketplace Microservices Architecture

      This gateway provides a unified entry point for all microservices including:
      - User Management Service
      - Product Catalog Service
      - Checkout Service
      - Payment Processing Service

      All authenticated endpoints require a valid JWT token in the Authorization header.
      `,
    )
    .setVersion('1.0')
    .setContact(
      'API Support',
      'https://github.com/DiegoPorfirio01',
      'porfiriodiego64@gmail.com',
    )
    // .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    // .setTermsOfService('https://marketplace.com/terms')
    .addServer(
      `http://localhost:${process.env.PORT || 3005}`,
      'Local Development Server',
    )
    // .addServer('https://api-dev.marketplace.com', 'Development Environment')
    // .addServer('https://api-staging.marketplace.com', 'Staging Environment')
    // .addServer('https://api.marketplace.com', 'Production Environment')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('Authentication', 'User authentication and authorization endpoints')
    .addTag('Health', 'Service health check and status monitoring')
    .addTag('Proxy', 'Microservice proxy endpoints')
    .addApiKey(
      {
        type: 'apiKey',
        name: 'X-API-Key',
        in: 'header',
        description: 'API Key for service-to-service communication',
      },
      'session-auth',
    )
    .addTag('Authentication', 'Authentication endpoints')
    .addTag('Users', 'Users endpoints')
    .addTag('Products', 'Products endpoints')
    .addTag('Checkout', 'Checkout endpoints')
    .addTag('Payments', 'Payments endpoints')
    .addTag('Health', 'Health endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT || 3005;
  await app.listen(port);

  console.log(`🚀 API Gateway running on port ${port}`);
  console.log(`📚 Swagger documentation: <http://localhost>:${port}/api`);
}

bootstrap();
