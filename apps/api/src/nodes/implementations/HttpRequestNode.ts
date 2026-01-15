/**
 * HTTP Request Node
 * 
 * A node that makes HTTP requests to external APIs.
 * This serves as a reference implementation for creating custom nodes.
 */

import { BaseNode } from '../BaseNode';
import {
    NodeCategory,
    NodeCredentials,
    NodeExecutionContext,
    NodeInputData,
    NodeOutputData,
    NodeProperty,
} from '../Node.interface';

export class HttpRequestNode extends BaseNode {
    // ============================================================
    // NODE METADATA
    // ============================================================

    readonly name = 'http-request';
    readonly displayName = 'HTTP Request';
    readonly description = 'Make HTTP requests to any URL and process the response';
    readonly version = 1;
    readonly category: NodeCategory = 'action';

    readonly icon = {
        type: 'fa' as const,
        value: 'fa-globe',
        color: '#3498db',
    };

    readonly defaults = {
        name: 'HTTP Request',
        color: '#3498db',
    };

    // ============================================================
    // NODE PROPERTIES (UI CONFIGURATION)
    // ============================================================

    readonly properties: NodeProperty[] = [
        {
            name: 'method',
            displayName: 'Method',
            type: 'options',
            default: 'GET',
            required: true,
            description: 'The HTTP method to use',
            options: [
                { name: 'GET', value: 'GET', description: 'Retrieve data' },
                { name: 'POST', value: 'POST', description: 'Create data' },
                { name: 'PUT', value: 'PUT', description: 'Update data (full)' },
                { name: 'PATCH', value: 'PATCH', description: 'Update data (partial)' },
                { name: 'DELETE', value: 'DELETE', description: 'Delete data' },
                { name: 'HEAD', value: 'HEAD', description: 'Get headers only' },
                { name: 'OPTIONS', value: 'OPTIONS', description: 'Get allowed methods' },
            ],
        },
        {
            name: 'url',
            displayName: 'URL',
            type: 'string',
            default: '',
            required: true,
            placeholder: 'https://api.example.com/endpoint',
            description: 'The URL to make the request to',
        },
        {
            name: 'authentication',
            displayName: 'Authentication',
            type: 'options',
            default: 'none',
            description: 'The authentication method to use',
            options: [
                { name: 'None', value: 'none' },
                { name: 'Basic Auth', value: 'basicAuth' },
                { name: 'Bearer Token', value: 'bearerToken' },
                { name: 'API Key', value: 'apiKey' },
            ],
        },
        {
            name: 'bearerToken',
            displayName: 'Bearer Token',
            type: 'string',
            default: '',
            placeholder: 'Enter your token',
            description: 'The bearer token for authentication',
            displayOptions: {
                show: { authentication: ['bearerToken'] },
            },
        },
        {
            name: 'apiKey',
            displayName: 'API Key',
            type: 'string',
            default: '',
            placeholder: 'Enter your API key',
            description: 'The API key for authentication',
            displayOptions: {
                show: { authentication: ['apiKey'] },
            },
        },
        {
            name: 'apiKeyHeader',
            displayName: 'API Key Header',
            type: 'string',
            default: 'X-API-Key',
            placeholder: 'X-API-Key',
            description: 'The header name for the API key',
            displayOptions: {
                show: { authentication: ['apiKey'] },
            },
        },
        {
            name: 'sendHeaders',
            displayName: 'Send Headers',
            type: 'boolean',
            default: false,
            description: 'Whether to send custom headers',
        },
        {
            name: 'headers',
            displayName: 'Headers',
            type: 'json',
            default: '{}',
            placeholder: '{"Content-Type": "application/json"}',
            description: 'Custom headers to send with the request',
            displayOptions: {
                show: { sendHeaders: [true] },
            },
        },
        {
            name: 'sendBody',
            displayName: 'Send Body',
            type: 'boolean',
            default: false,
            description: 'Whether to send a request body',
            displayOptions: {
                show: { method: ['POST', 'PUT', 'PATCH'] },
            },
        },
        {
            name: 'bodyContentType',
            displayName: 'Body Content Type',
            type: 'options',
            default: 'json',
            description: 'The content type of the request body',
            options: [
                { name: 'JSON', value: 'json' },
                { name: 'Form Data', value: 'formData' },
                { name: 'Raw', value: 'raw' },
            ],
            displayOptions: {
                show: { sendBody: [true] },
            },
        },
        {
            name: 'body',
            displayName: 'Body',
            type: 'json',
            default: '{}',
            placeholder: '{"key": "value"}',
            description: 'The request body',
            displayOptions: {
                show: { sendBody: [true] },
            },
        },
        {
            name: 'timeout',
            displayName: 'Timeout (ms)',
            type: 'number',
            default: 30000,
            description: 'Request timeout in milliseconds',
            typeOptions: {
                minValue: 1000,
                maxValue: 300000,
            },
        },
        {
            name: 'returnFullResponse',
            displayName: 'Return Full Response',
            type: 'boolean',
            default: false,
            description: 'Return headers and status in addition to body',
        },
    ];

    // ============================================================
    // NODE EXECUTION
    // ============================================================

    protected async run(
        context: NodeExecutionContext,
        inputData: NodeInputData,
        credentials?: NodeCredentials
    ): Promise<NodeOutputData> {
        // Process each input item
        return this.processItems(context, inputData, async (item, index) => {
            // Get parameters
            const method = this.getParam<string>(context, 'method', index, 'GET');
            const url = this.getParam<string>(context, 'url', index);
            const authentication = this.getParam<string>(context, 'authentication', index, 'none');
            const timeout = this.getParam<number>(context, 'timeout', index, 30000);
            const returnFullResponse = this.getParam<boolean>(context, 'returnFullResponse', index, false);

            // Build headers
            const headers: Record<string, string> = {};

            // Add authentication
            if (authentication === 'bearerToken') {
                const token = this.getParam<string>(context, 'bearerToken', index);
                headers['Authorization'] = `Bearer ${token}`;
            } else if (authentication === 'apiKey') {
                const apiKey = this.getParam<string>(context, 'apiKey', index);
                const apiKeyHeader = this.getParam<string>(context, 'apiKeyHeader', index, 'X-API-Key');
                headers[apiKeyHeader] = apiKey;
            }

            // Add custom headers
            const sendHeaders = this.getParam<boolean>(context, 'sendHeaders', index, false);
            if (sendHeaders) {
                const customHeaders = this.getParam<string>(context, 'headers', index, '{}');
                try {
                    const parsedHeaders = JSON.parse(customHeaders);
                    Object.assign(headers, parsedHeaders);
                } catch (e) {
                    context.logger.warn('Failed to parse custom headers', { error: String(e) });
                }
            }

            // Build body
            let body: unknown = undefined;
            const sendBody = this.getParam<boolean>(context, 'sendBody', index, false);
            if (sendBody && ['POST', 'PUT', 'PATCH'].includes(method)) {
                const bodyContent = this.getParam<string>(context, 'body', index, '{}');
                const bodyContentType = this.getParam<string>(context, 'bodyContentType', index, 'json');

                if (bodyContentType === 'json') {
                    headers['Content-Type'] = 'application/json';
                    try {
                        body = JSON.parse(bodyContent);
                    } catch (e) {
                        body = bodyContent;
                    }
                } else {
                    body = bodyContent;
                }
            }

            // Make the request
            const response = await this.httpRequest(context, {
                method: method as any,
                url,
                headers,
                body,
                timeout,
                returnFullResponse,
            });

            // Return result
            if (returnFullResponse && typeof response === 'object') {
                return {
                    json: {
                        ...item.json,
                        response,
                    },
                };
            }

            return {
                json: {
                    ...item.json,
                    data: response,
                },
            };
        });
    }
}

// Export singleton instance
export const httpRequestNode = new HttpRequestNode();
