/**
 * FlowAutomator API - Production Ready Entry Point
 */

import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters';
import helmet from 'helmet';

async function bootstrap() {
    const logger = new Logger('Bootstrap');
    const app = await NestFactory.create(AppModule);

    // ======================================================
    // SECURITY MIDDLEWARE
    // ======================================================

    // Helmet - Security headers
    app.use(helmet({
        contentSecurityPolicy: process.env.NODE_ENV === 'production',
    }));

    // CORS Configuration
    const allowedOrigins = process.env.CORS_ORIGINS?.split(',') || [
        'http://localhost:3000',
        'http://localhost:3005',
    ];

    app.enableCors({
        origin: (origin, callback) => {
            // Allow requests with no origin (mobile apps, Postman, etc.)
            if (!origin) return callback(null, true);

            if (allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    });

    // ======================================================
    // VALIDATION & ERROR HANDLING
    // ======================================================

    // Global validation pipe
    app.useGlobalPipes(new ValidationPipe({
        whitelist: true, // Strip unknown properties
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
            enableImplicitConversion: true,
        },
    }));

    // Global exception filter
    app.useGlobalFilters(new HttpExceptionFilter());

    // API prefix
    app.setGlobalPrefix('api', {
        exclude: ['health', '/'],
    });

    // ======================================================
    // START SERVER
    // ======================================================

    const port = process.env.PORT || 3001;
    await app.listen(port);

    logger.log(`🚀 FlowAutomator API running on: http://localhost:${port}`);
    logger.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
    logger.log(`🔒 CORS enabled for: ${allowedOrigins.join(', ')}`);
}

bootstrap();
