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
# Marketplace API Gateway

API Gateway for Marketplace Microservices Architecture

This gateway provides a unified entry point for all microservices including:

- **User Management Service** - Handle user registration, authentication, and profile management
- **Product Catalog Service** - Manage product listings, categories, and inventory
- **Checkout Service** - Process orders and shopping cart operations
- **Payment Processing Service** - Handle payment transactions and processing

## Authentication

All authenticated endpoints require a valid JWT token in the Authorization header.

Format: \`Authorization: Bearer <your-token>\`

## Rate Limiting

The API implements rate limiting to ensure fair usage:
- **Short-term**: 10 requests per second
- **Medium-term**: 100 requests per minute
- **Long-term**: 1000 requests per 90 seconds

## Getting Started

1. Register a new account using the \`/auth/register\` endpoint
2. Login using \`/auth/login\` to obtain your JWT token
3. Use the "Authorize" button above to set your token
4. Explore the API endpoints below
      `,
    )
    .setVersion('1.0')
    .setContact(
      'API Support',
      'https://github.com/DiegoPorfirio01',
      'porfiriodiego64@gmail.com',
    )
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .addServer(
      `http://localhost:${process.env.PORT || 3005}`,
      'Local Development Server',
    )
    .addServer(
      process.env.DEV_SERVER_URL || 'https://api-dev.marketplace.com',
      'Development Environment',
    )
    .addServer(
      process.env.STAGING_SERVER_URL || 'https://api-staging.marketplace.com',
      'Staging Environment',
    )
    .addServer(
      process.env.PROD_SERVER_URL || 'https://api.marketplace.com',
      'Production Environment',
    )
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description:
          'Enter your JWT token. You can obtain this token by logging in through the /auth/login endpoint.',
        in: 'header',
      },
      'JWT-auth',
    )
    .addApiKey(
      {
        type: 'apiKey',
        name: 'X-API-Key',
        in: 'header',
        description:
          'API Key for service-to-service communication. Used for internal microservice communication.',
      },
      'session-auth',
    )
    .addTag(
      'Authentication',
      'User authentication and authorization endpoints. Register, login, and manage user sessions.',
    )
    .addTag(
      'Users',
      'User management endpoints. Create, read, update, and delete user profiles.',
    )
    .addTag(
      'Products',
      'Product catalog endpoints. Browse, search, and manage product listings.',
    )
    .addTag(
      'Checkout',
      'Checkout and order processing endpoints. Manage shopping carts and process orders.',
    )
    .addTag(
      'Payments',
      'Payment processing endpoints. Handle payment transactions and refunds.',
    )
    .addTag(
      'Health',
      'Service health check and status monitoring endpoints. Monitor service availability and status.',
    )
    .addTag(
      'Proxy',
      'Microservice proxy endpoints. Direct access to underlying microservices.',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      filter: true,
      displayRequestDuration: true,
      docExpansion: 'list',
      defaultModelsExpandDepth: 2,
      defaultModelExpandDepth: 2,
      showExtensions: true,
      showCommonExtensions: true,
      tryItOutEnabled: true,
    },
    customSiteTitle: 'Marketplace API Gateway',
    customfavIcon: '/favicon.ico',
    customCss: `
      .swagger-ui .topbar { display: none; }
      .swagger-ui .info { margin: 20px 0; }
      .swagger-ui .info .title { color: #3b82f6; }
      .swagger-ui .scheme-container { background: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0; }
      .swagger-ui .btn.authorize { background-color: #3b82f6; border-color: #3b82f6; }
      .swagger-ui .btn.authorize:hover { background-color: #2563eb; }
      .swagger-ui .opblock.opblock-post { border-color: #10b981; background: rgba(16, 185, 129, 0.1); }
      .swagger-ui .opblock.opblock-get { border-color: #3b82f6; background: rgba(59, 130, 246, 0.1); }
      .swagger-ui .opblock.opblock-put { border-color: #f59e0b; background: rgba(245, 158, 11, 0.1); }
      .swagger-ui .opblock.opblock-delete { border-color: #ef4444; background: rgba(239, 68, 68, 0.1); }
      .swagger-ui .opblock.opblock-patch { border-color: #8b5cf6; background: rgba(139, 92, 246, 0.1); }
    `,
  });

  const port = process.env.PORT || 3005;
  await app.listen(port);

  console.log(`🚀 API Gateway running on port ${port}`);
  console.log(`📚 Swagger documentation: http://localhost:${port}/api`);
}

void bootstrap();
