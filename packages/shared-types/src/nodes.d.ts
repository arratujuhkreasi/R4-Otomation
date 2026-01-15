export declare const NODE_TYPES: {
    readonly HTTP_REQUEST: "httpRequest";
    readonly WEBHOOK: "webhook";
    readonly CRON: "cron";
    readonly CODE: "code";
    readonly IF: "if";
    readonly SWITCH: "switch";
    readonly MERGE: "merge";
    readonly SET: "set";
};
export type NodeType = typeof NODE_TYPES[keyof typeof NODE_TYPES];
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';
export interface HttpRequestParams {
    url: string;
    method: HttpMethod;
    headers?: Record<string, string>;
    body?: unknown;
    timeout?: number;
    retryOnFail?: boolean;
    maxRetries?: number;
}
export interface WebhookParams {
    path: string;
    httpMethod: HttpMethod | HttpMethod[];
    responseMode: 'onReceived' | 'lastNode';
    responseCode?: number;
}
export interface CronParams {
    cronExpression: string;
    timezone?: string;
}
export interface CodeParams {
    code: string;
    mode: 'runOnceForAllItems' | 'runOnceForEachItem';
}
