import { Injectable, Logger } from '@nestjs/common';

interface HttpRequestParams {
    url?: string;
    method?: string;
    headers?: Record<string, string>;
    body?: unknown;
}

@Injectable()
export class HttpRequestExecutor {
    private readonly logger = new Logger(HttpRequestExecutor.name);

    /**
     * Execute an HTTP request node
     */
    async execute(
        params: HttpRequestParams,
        inputData: unknown,
    ): Promise<unknown> {
        const url = params.url;
        const method = (params.method || 'GET').toUpperCase();
        const headers = params.headers || {};

        if (!url) {
            throw new Error('HTTP Request node requires a URL parameter');
        }

        this.logger.log(`Executing HTTP ${method} request to ${url}`);

        try {
            const fetchOptions: RequestInit = {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    ...headers,
                },
            };

            // Add body for non-GET requests
            if (method !== 'GET' && method !== 'HEAD') {
                fetchOptions.body = JSON.stringify(params.body || inputData || {});
            }

            const response = await fetch(url, fetchOptions);

            // Parse response
            const contentType = response.headers.get('content-type');
            let data: unknown;

            if (contentType?.includes('application/json')) {
                data = await response.json();
            } else {
                data = await response.text();
            }

            if (!response.ok) {
                throw new Error(
                    `HTTP request failed with status ${response.status}: ${response.statusText}`,
                );
            }

            this.logger.log(`HTTP request successful: ${response.status}`);

            return {
                statusCode: response.status,
                statusText: response.statusText,
                headers: Object.fromEntries(response.headers.entries()),
                data,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.logger.error(`HTTP request failed: ${errorMessage}`);
            throw new Error(`HTTP request to ${url} failed: ${errorMessage}`);
        }
    }
}
