/**
 * BaseNode - Abstract class that all custom nodes should extend
 * 
 * Provides automatic error handling, logging, and common utilities
 * for building workflow nodes in FlowAutomator.
 */

import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import {
    INode,
    NodeCategory,
    NodeCredentialRequirement,
    NodeCredentials,
    NodeDataItem,
    NodeExecutionContext,
    NodeExecutionError,
    NodeIcon,
    NodeInputData,
    NodeOutputData,
    NodeProperty,
    HttpRequestOptions,
} from './Node.interface';

/**
 * Abstract BaseNode class that implements common functionality
 * and provides automatic error handling for all nodes.
 */
export abstract class BaseNode implements INode {
    // Required properties - must be defined by subclasses
    abstract readonly name: string;
    abstract readonly displayName: string;
    abstract readonly description: string;
    abstract readonly properties: NodeProperty[];

    // Optional properties with defaults
    readonly version: number = 1;
    readonly category: NodeCategory = 'action';
    readonly icon?: NodeIcon;
    readonly defaults?: { name: string; color?: string };
    readonly inputs: string[] = ['main'];
    readonly outputs: string[] = ['main'];
    readonly outputNames?: string[];
    readonly credentials?: NodeCredentialRequirement[];

    /**
     * The main execution method that subclasses must implement.
     * This method should contain the core logic of the node.
     */
    protected abstract run(
        context: NodeExecutionContext,
        inputData: NodeInputData,
        credentials?: NodeCredentials
    ): Promise<NodeOutputData>;

    /**
     * Execute method with automatic error handling.
     * This wraps the run() method with try-catch and logging.
     */
    async execute(
        context: NodeExecutionContext,
        inputData: NodeInputData,
        credentials?: NodeCredentials
    ): Promise<NodeOutputData> {
        const startTime = Date.now();

        context.logger.info(`Starting execution of node: ${this.displayName}`, {
            nodeType: this.name,
            nodeId: context.nodeId,
            itemCount: inputData.items.length,
        });

        try {
            // Validate required credentials
            if (this.credentials?.some(c => c.required) && !credentials) {
                throw new NodeExecutionError(
                    'Missing required credentials',
                    this.name,
                    context.nodeId,
                    { description: 'This node requires credentials to be configured.' }
                );
            }

            // Validate required parameters
            this.validateRequiredProperties(context, inputData);

            // Execute the node's main logic
            const result = await this.run(context, inputData, credentials);

            const executionTime = Date.now() - startTime;
            context.logger.info(`Completed execution of node: ${this.displayName}`, {
                nodeType: this.name,
                nodeId: context.nodeId,
                executionTime,
                outputItems: result.items.flat().length,
            });

            // Add execution metadata
            return {
                ...result,
                metadata: {
                    ...result.metadata,
                    executionTime,
                    itemsProcessed: inputData.items.length,
                },
            };
        } catch (error) {
            const executionTime = Date.now() - startTime;

            // Transform error into NodeExecutionError if it isn't already
            const nodeError = this.handleError(error, context);

            context.logger.error(`Failed execution of node: ${this.displayName}`, {
                nodeType: this.name,
                nodeId: context.nodeId,
                executionTime,
                error: nodeError.message,
                description: nodeError.description,
            });

            throw nodeError;
        }
    }

    /**
     * Validate required properties are set
     */
    protected validateRequiredProperties(
        context: NodeExecutionContext,
        inputData: NodeInputData
    ): void {
        const requiredProps = this.properties.filter(p => p.required);

        for (const prop of requiredProps) {
            const value = context.getNodeParameter(prop.name, 0);

            if (value === undefined || value === null || value === '') {
                throw new NodeExecutionError(
                    `Missing required parameter: ${prop.displayName}`,
                    this.name,
                    context.nodeId,
                    {
                        description: prop.description || `The parameter "${prop.displayName}" is required.`,
                        context: { parameter: prop.name },
                    }
                );
            }
        }
    }

    /**
     * Transform any error into a NodeExecutionError
     */
    protected handleError(error: unknown, context: NodeExecutionContext): NodeExecutionError {
        if (error instanceof NodeExecutionError) {
            return error;
        }

        if (error instanceof AxiosError) {
            return this.handleAxiosError(error, context);
        }

        if (error instanceof Error) {
            return new NodeExecutionError(
                error.message,
                this.name,
                context.nodeId,
                {
                    description: 'An unexpected error occurred during node execution.',
                    cause: error,
                }
            );
        }

        return new NodeExecutionError(
            String(error),
            this.name,
            context.nodeId,
            { description: 'An unknown error occurred.' }
        );
    }

    /**
     * Handle Axios HTTP errors with detailed messages
     */
    protected handleAxiosError(error: AxiosError, context: NodeExecutionContext): NodeExecutionError {
        const status = error.response?.status;
        const statusText = error.response?.statusText;
        const url = error.config?.url;

        let message = 'HTTP Request failed';
        let description = '';

        if (error.code === 'ECONNREFUSED') {
            message = 'Connection refused';
            description = `Could not connect to ${url}. The server may be down or the URL may be incorrect.`;
        } else if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
            message = 'Request timed out';
            description = `The request to ${url} timed out. Try increasing the timeout or check your network connection.`;
        } else if (status) {
            message = `HTTP ${status}: ${statusText}`;

            switch (status) {
                case 400:
                    description = 'Bad Request - The server could not understand the request. Check your parameters.';
                    break;
                case 401:
                    description = 'Unauthorized - Authentication failed. Check your credentials.';
                    break;
                case 403:
                    description = 'Forbidden - You do not have permission to access this resource.';
                    break;
                case 404:
                    description = `Not Found - The resource at ${url} was not found.`;
                    break;
                case 429:
                    description = 'Too Many Requests - Rate limit exceeded. Try again later.';
                    break;
                case 500:
                    description = 'Internal Server Error - The server encountered an error.';
                    break;
                case 502:
                    description = 'Bad Gateway - The server received an invalid response from upstream.';
                    break;
                case 503:
                    description = 'Service Unavailable - The server is temporarily unavailable.';
                    break;
                default:
                    description = `The server responded with status ${status}.`;
            }
        }

        return new NodeExecutionError(
            message,
            this.name,
            context.nodeId,
            {
                description,
                cause: error,
                context: {
                    url,
                    status,
                    method: error.config?.method?.toUpperCase(),
                    responseData: error.response?.data,
                },
            }
        );
    }

    // ============================================================
    // HELPER METHODS FOR SUBCLASSES
    // ============================================================

    /**
     * Make an HTTP request with automatic error handling
     */
    protected async httpRequest(
        context: NodeExecutionContext,
        options: HttpRequestOptions
    ): Promise<unknown> {
        const axiosConfig: AxiosRequestConfig = {
            method: options.method,
            url: options.url,
            headers: options.headers,
            data: options.body,
            params: options.qs,
            timeout: options.timeout || 30000,
            responseType: options.encoding === null ? 'arraybuffer' : 'json',
        };

        context.logger.debug('Making HTTP request', {
            method: options.method,
            url: options.url,
        });

        const response = await axios(axiosConfig);

        if (options.returnFullResponse) {
            return {
                data: response.data,
                headers: response.headers,
                status: response.status,
                statusText: response.statusText,
            };
        }

        return response.data;
    }

    /**
     * Create output data items from an array of objects
     */
    protected createOutputItems(data: Record<string, unknown>[]): NodeDataItem[] {
        return data.map(json => ({ json }));
    }

    /**
     * Create a single output branch
     */
    protected createOutput(items: NodeDataItem[]): NodeOutputData {
        return { items: [items] };
    }

    /**
     * Create multiple output branches (for IF/Switch nodes)
     */
    protected createMultiOutput(...branches: NodeDataItem[][]): NodeOutputData {
        return { items: branches };
    }

    /**
     * Create an empty output (no items)
     */
    protected createEmptyOutput(): NodeOutputData {
        return { items: [[]] };
    }

    /**
     * Pass through input items unchanged
     */
    protected passThroughItems(inputData: NodeInputData): NodeOutputData {
        return { items: [inputData.items] };
    }

    /**
     * Get a parameter value with type safety
     */
    protected getParam<T>(
        context: NodeExecutionContext,
        name: string,
        itemIndex: number = 0,
        defaultValue?: T
    ): T {
        return context.getNodeParameter<T>(name, itemIndex, defaultValue as T);
    }

    /**
     * Process each input item with a callback
     */
    protected async processItems(
        context: NodeExecutionContext,
        inputData: NodeInputData,
        processor: (item: NodeDataItem, index: number) => Promise<NodeDataItem | NodeDataItem[] | null>
    ): Promise<NodeOutputData> {
        const outputItems: NodeDataItem[] = [];

        for (let i = 0; i < inputData.items.length; i++) {
            try {
                const result = await processor(inputData.items[i], i);

                if (result === null) {
                    // Skip this item
                    continue;
                }

                if (Array.isArray(result)) {
                    outputItems.push(...result);
                } else {
                    outputItems.push(result);
                }
            } catch (error) {
                context.logger.warn(`Error processing item ${i}`, {
                    error: error instanceof Error ? error.message : String(error),
                });

                // Add error item
                outputItems.push({
                    json: inputData.items[i].json,
                    error: {
                        message: error instanceof Error ? error.message : String(error),
                        timestamp: new Date(),
                    },
                });
            }
        }

        return this.createOutput(outputItems);
    }
}
