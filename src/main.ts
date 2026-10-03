import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Prefijo global de API
  app.setGlobalPrefix('api/v1');

  // Habilitar CORS para integración con Frontend (Vite / Vercel)
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:4173',
      /^http:\/\/localhost:[0-9]+$/,
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  // Tubería de validación global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
    }),
  );

  // Configuración de Documentación Interactiva Swagger / OpenAPI
  const swaggerConfig = new DocumentBuilder()
    .setTitle('NEXUS API · Inteligencia de Capital Humano')
    .setDescription(
      'API REST empresarial para People Analytics, perfiles 360°, cadena de valor de Porter, selección de personal, evaluaciones 9-Box y exportaciones.',
    )
    .setVersion('1.1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Ingresa el token JWT recibido en /auth/login',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'NEXUS API Docs',
  });

  const port = process.env.PORT ?? 4000;
  await app.listen(port);
  console.log(`🚀 NEXUS API REST ejecutándose en: http://localhost:${port}/api/v1`);
  console.log(`📑 Swagger UI disponible en:        http://localhost:${port}/api/docs`);
}

await bootstrap();
