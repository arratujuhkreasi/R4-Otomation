/**
 * Node type constants
 */
export const NODE_TYPES = {
    HTTP_REQUEST: 'httpRequest',
    WEBHOOK: 'webhook',
    CRON: 'cron',
    CODE: 'code',
    IF: 'if',
    SWITCH: 'switch',
    MERGE: 'merge',
    SET: 'set',
} as const;

export type NodeType = typeof NODE_TYPES[keyof typeof NODE_TYPES];

/**
 * HTTP Methods for HTTP Request node
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';

/**
 * HTTP Request node parameters
 */
export interface HttpRequestParams {
    url: string;
    method: HttpMethod;
    headers?: Record<string, string>;
    body?: unknown;
    timeout?: number;
    retryOnFail?: boolean;
    maxRetries?: number;
}

/**
 * Webhook node parameters
 */
export interface WebhookParams {
    path: string;
    httpMethod: HttpMethod | HttpMethod[];
    responseMode: 'onReceived' | 'lastNode';
    responseCode?: number;
}

/**
 * Cron node parameters
 */
export interface CronParams {
    cronExpression: string;
    timezone?: string;
}

/**
 * Code node parameters
 */
export interface CodeParams {
    code: string;
    mode: 'runOnceForAllItems' | 'runOnceForEachItem';
}
