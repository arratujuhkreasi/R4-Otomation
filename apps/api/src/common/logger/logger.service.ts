/**
 * Winston Logger Service
 * 
 * Production-ready logging with file rotation and formatting
 */

import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import * as winston from 'winston';
import 'winston-daily-rotate-file';
import * as path from 'path';

@Injectable()
export class LoggerService implements NestLoggerService {
    private logger: winston.Logger;

    constructor() {
        const logDir = process.env.LOG_DIR || 'logs';
        const isProduction = process.env.NODE_ENV === 'production';

        // Log format
        const logFormat = winston.format.combine(
            winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            winston.format.errors({ stack: true }),
            winston.format.printf(({ timestamp, level, message, context, stack }) => {
                const ctx = context ? `[${context}] ` : '';
                const stackTrace = stack ? `\n${stack}` : '';
                return `${timestamp} ${level.toUpperCase().padEnd(7)} ${ctx}${message}${stackTrace}`;
            })
        );

        // Console format (with colors)
        const consoleFormat = winston.format.combine(
            winston.format.colorize({ all: true }),
            winston.format.timestamp({ format: 'HH:mm:ss' }),
            winston.format.printf(({ timestamp, level, message, context }) => {
                const ctx = context ? `[${context}] ` : '';
                return `${timestamp} ${level} ${ctx}${message}`;
            })
        );

        // Transports
        const transports: winston.transport[] = [];

        // Console (always)
        transports.push(
            new winston.transports.Console({
                level: isProduction ? 'info' : 'debug',
                format: consoleFormat,
            })
        );

        // File transports (production)
        if (isProduction) {
            // Combined log
            transports.push(
                new winston.transports.DailyRotateFile({
                    filename: path.join(logDir, 'combined-%DATE%.log'),
                    datePattern: 'YYYY-MM-DD',
                    maxSize: '20m',
                    maxFiles: '14d',
                    format: logFormat,
                })
            );

            // Error log
            transports.push(
                new winston.transports.DailyRotateFile({
                    filename: path.join(logDir, 'error-%DATE%.log'),
                    datePattern: 'YYYY-MM-DD',
                    level: 'error',
                    maxSize: '20m',
                    maxFiles: '30d',
                    format: logFormat,
                })
            );

            // Audit log (for security events)
            transports.push(
                new winston.transports.DailyRotateFile({
                    filename: path.join(logDir, 'audit-%DATE%.log'),
                    datePattern: 'YYYY-MM-DD',
                    level: 'info',
                    maxSize: '20m',
                    maxFiles: '90d',
                    format: logFormat,
                })
            );
        }

        this.logger = winston.createLogger({
            level: isProduction ? 'info' : 'debug',
            transports,
        });
    }

    log(message: string, context?: string) {
        this.logger.info(message, { context });
    }

    error(message: string, trace?: string, context?: string) {
        this.logger.error(message, { context, stack: trace });
    }

    warn(message: string, context?: string) {
        this.logger.warn(message, { context });
    }

    debug(message: string, context?: string) {
        this.logger.debug(message, { context });
    }

    verbose(message: string, context?: string) {
        this.logger.verbose(message, { context });
    }

    // Audit logging for security events
    audit(action: string, details: Record<string, unknown>, context?: string) {
        this.logger.info(`AUDIT: ${action}`, {
            context: context || 'Audit',
            ...details,
        });
    }

    // Performance logging
    performance(operation: string, durationMs: number, context?: string) {
        const level = durationMs > 1000 ? 'warn' : 'info';
        this.logger[level](`PERF: ${operation} completed in ${durationMs}ms`, { context });
    }
}
