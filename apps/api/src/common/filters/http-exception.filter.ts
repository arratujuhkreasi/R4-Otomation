/**
 * HTTP Exception Filter
 * 
 * Global exception handler with logging
 */

import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

interface ErrorResponse {
    statusCode: number;
    message: string | string[];
    error: string;
    timestamp: string;
    path: string;
    method: string;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger('ExceptionFilter');

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        let status: number;
        let message: string | string[];
        let error: string;

        if (exception instanceof HttpException) {
            status = exception.getStatus();
            const exceptionResponse = exception.getResponse();

            if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
                const resp = exceptionResponse as Record<string, unknown>;
                message = (resp.message as string | string[]) || exception.message;
                error = (resp.error as string) || 'Error';
            } else {
                message = exception.message;
                error = 'Error';
            }
        } else if (exception instanceof Error) {
            status = HttpStatus.INTERNAL_SERVER_ERROR;
            message = 'Internal server error';
            error = 'Internal Server Error';

            // Log unexpected errors
            this.logger.error(
                `Unexpected error: ${exception.message}`,
                exception.stack,
            );
        } else {
            status = HttpStatus.INTERNAL_SERVER_ERROR;
            message = 'Unknown error';
            error = 'Internal Server Error';
        }

        const errorResponse: ErrorResponse = {
            statusCode: status,
            message,
            error,
            timestamp: new Date().toISOString(),
            path: request.url,
            method: request.method,
        };

        // Log error (except 400-level client errors)
        if (status >= 500) {
            this.logger.error(
                `${request.method} ${request.url} - ${status}`,
                JSON.stringify(errorResponse),
            );
        } else if (status >= 400) {
            this.logger.warn(`${request.method} ${request.url} - ${status}`);
        }

        response.status(status).json(errorResponse);
    }
}
