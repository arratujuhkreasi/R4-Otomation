/**
 * Node Architecture Standard for FlowAutomator
 * 
 * This file defines the strict interfaces for creating custom nodes
 * in the workflow automation system.
 */

/**
 * Input field types for node properties
 */
export type NodePropertyType =
    | 'string'
    | 'number'
    | 'boolean'
    | 'options'
    | 'multiOptions'
    | 'json'
    | 'code'
    | 'credentials'
    | 'collection'
    | 'fixedCollection';

/**
 * Display options for conditional property visibility
 */
export interface DisplayOptions {
    show?: Record<string, unknown[]>;
    hide?: Record<string, unknown[]>;
}

/**
 * Option for select/dropdown fields
 */
export interface NodePropertyOption {
    name: string;
    value: string | number | boolean;
    description?: string;
}

/**
 * Node Property - Defines an input field for a node
 */
export interface NodeProperty {
    /** Internal name for the property (used in code) */
    name: string;

    /** Display label shown in UI */
    displayName: string;

    /** Type of the input field */
    type: NodePropertyType;

    /** Default value for the property */
    default?: unknown;

    /** Whether this property is required */
    required?: boolean;

    /** Placeholder text for input fields */
    placeholder?: string;

    /** Description/help text shown in UI */
    description?: string;

    /** Options for 'options' or 'multiOptions' type */
    options?: NodePropertyOption[];

    /** Conditional display rules */
    displayOptions?: DisplayOptions;

    /** For 'code' type - the language (javascript, python, etc.) */
    typeOptions?: {
        language?: string;
        rows?: number;
        minValue?: number;
        maxValue?: number;
        alwaysOpenEditWindow?: boolean;
    };

    /** Nested properties for 'collection' or 'fixedCollection' types */
    properties?: NodeProperty[];
}

/**
 * Credential requirement for a node
 */
export interface NodeCredentialRequirement {
    /** Name of the credential type */
    name: string;

    /** Whether credentials are required */
    required: boolean;

    /** Display name shown in UI */
    displayName?: string;
}

/**
 * Node category for grouping in UI
 */
export type NodeCategory =
    | 'trigger'
    | 'action'
    | 'logic'
    | 'transform'
    | 'data'
    | 'communication'
    | 'developer'
    | 'utility';

/**
 * Node icon definition
 */
export interface NodeIcon {
    /** Icon type: 'file' for SVG/PNG, 'fa' for Font Awesome */
    type: 'file' | 'fa';

    /** Path to icon file or Font Awesome class */
    value: string;

    /** Background color for the node */
    color?: string;
}

/**
 * Input data structure passed to node execution
 */
export interface NodeInputData {
    /** Data items from previous nodes */
    items: NodeDataItem[];

    /** The specific input index (for nodes with multiple inputs) */
    inputIndex?: number;
}

/**
 * Single data item in the workflow
 */
export interface NodeDataItem {
    /** JSON data payload */
    json: Record<string, unknown>;

    /** Binary data (files, images, etc.) */
    binary?: Record<string, NodeBinaryData>;

    /** Error information if this item represents an error */
    error?: NodeError;

    /** Indicates if execution should pause after this item */
    pairedItem?: {
        item: number;
        input?: number;
    };
}

/**
 * Binary data structure
 */
export interface NodeBinaryData {
    /** MIME type of the data */
    mimeType: string;

    /** File extension */
    fileExtension?: string;

    /** Original file name */
    fileName?: string;

    /** Base64 encoded data or file path */
    data: string;

    /** Size in bytes */
    fileSize?: number;
}

/**
 * Node error structure
 */
export interface NodeError {
    message: string;
    description?: string;
    stack?: string;
    timestamp?: Date;
}

/**
 * Output data from node execution
 */
export interface NodeOutputData {
    /** Output items (can be multiple for branching nodes) */
    items: NodeDataItem[][];

    /** Metadata about the execution */
    metadata?: {
        executionTime?: number;
        itemsProcessed?: number;
    };
}

/**
 * Credentials passed to node execution
 */
export interface NodeCredentials {
    [credentialType: string]: {
        [key: string]: unknown;
    };
}

/**
 * Execution context provided to nodes
 */
export interface NodeExecutionContext {
    /** Workflow ID */
    workflowId: string;

    /** Execution ID */
    executionId: string;

    /** Node ID */
    nodeId: string;

    /** Get parameter value by name */
    getNodeParameter: <T = unknown>(parameterName: string, itemIndex: number, fallback?: T) => T;

    /** Get credentials by type */
    getCredentials: <T = Record<string, unknown>>(type: string) => Promise<T>;

    /** Helper functions */
    helpers: NodeHelpers;

    /** Logger instance */
    logger: NodeLogger;
}

/**
 * Helper functions available in execution context
 */
export interface NodeHelpers {
    /** Make HTTP request */
    httpRequest: (options: HttpRequestOptions) => Promise<unknown>;

    /** Get binary data as buffer */
    getBinaryDataBuffer: (itemIndex: number, propertyName: string) => Promise<Buffer>;

    /** Set binary data */
    setBinaryData: (data: Buffer, fileName: string, mimeType: string) => NodeBinaryData;

    /** Prepare output items */
    prepareOutputData: (items: NodeDataItem[]) => NodeOutputData;

    /** Return JSON data */
    returnJsonArray: (data: unknown[]) => NodeDataItem[];
}

/**
 * HTTP Request options for helper
 */
export interface HttpRequestOptions {
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';
    url: string;
    headers?: Record<string, string>;
    body?: unknown;
    qs?: Record<string, string>;
    timeout?: number;
    json?: boolean;
    encoding?: BufferEncoding | null;
    returnFullResponse?: boolean;
}

/**
 * Logger interface for nodes
 */
export interface NodeLogger {
    debug: (message: string, meta?: Record<string, unknown>) => void;
    info: (message: string, meta?: Record<string, unknown>) => void;
    warn: (message: string, meta?: Record<string, unknown>) => void;
    error: (message: string, meta?: Record<string, unknown>) => void;
}

/**
 * ============================================================
 * MAIN NODE INTERFACE
 * ============================================================
 * 
 * This is the strict interface that ALL custom nodes MUST implement.
 * It defines the contract between the node and the workflow engine.
 */
export interface INode {
    /**
     * Internal unique identifier for the node type
     * Convention: lowercase with hyphens (e.g., 'telegram-bot', 'http-request')
     */
    name: string;

    /**
     * Human-readable name shown in the UI
     */
    displayName: string;

    /**
     * Detailed description of what the node does
     */
    description: string;

    /**
     * Version of the node (for migration purposes)
     */
    version: number;

    /**
     * Category for grouping in the node panel
     */
    category: NodeCategory;

    /**
     * Icon definition for the node
     */
    icon?: NodeIcon;

    /**
     * Default name for new instances of this node
     */
    defaults?: {
        name: string;
        color?: string;
    };

    /**
     * Input configuration
     */
    inputs: string[];

    /**
     * Output configuration
     */
    outputs: string[];

    /**
     * Output names for branching nodes (e.g., ['true', 'false'] for IF node)
     */
    outputNames?: string[];

    /**
     * Credential types this node can use
     */
    credentials?: NodeCredentialRequirement[];

    /**
     * Array of input field definitions
     * These define the configuration UI for the node
     */
    properties: NodeProperty[];

    /**
     * The main execution method
     * 
     * @param context - Execution context with helpers and parameters
     * @param inputData - Data from previous nodes
     * @param credentials - Decrypted credentials
     * @returns Promise resolving to output data
     */
    execute(
        context: NodeExecutionContext,
        inputData: NodeInputData,
        credentials?: NodeCredentials
    ): Promise<NodeOutputData>;
}

/**
 * Trigger node interface - extends base node with trigger-specific methods
 */
export interface ITriggerNode extends INode {
    /**
     * Called when workflow is activated
     */
    activate?(context: NodeExecutionContext): Promise<void>;

    /**
     * Called when workflow is deactivated
     */
    deactivate?(context: NodeExecutionContext): Promise<void>;

    /**
     * Webhook configuration (for webhook triggers)
     */
    webhooks?: Array<{
        name: string;
        httpMethod: string | string[];
        path: string;
        responseMode?: 'onReceived' | 'lastNode';
    }>;
}

/**
 * Node execution error - thrown when node execution fails
 */
export class NodeExecutionError extends Error {
    public readonly nodeType: string;
    public readonly nodeId: string;
    public readonly description?: string;
    public readonly cause?: Error;
    public readonly timestamp: Date;
    public readonly context?: Record<string, unknown>;

    constructor(
        message: string,
        nodeType: string,
        nodeId: string,
        options?: {
            description?: string;
            cause?: Error;
            context?: Record<string, unknown>;
        }
    ) {
        super(message);
        this.name = 'NodeExecutionError';
        this.nodeType = nodeType;
        this.nodeId = nodeId;
        this.description = options?.description;
        this.cause = options?.cause;
        this.context = options?.context;
        this.timestamp = new Date();

        // Maintain proper stack trace
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, NodeExecutionError);
        }
    }

    toJSON() {
        return {
            name: this.name,
            message: this.message,
            nodeType: this.nodeType,
            nodeId: this.nodeId,
            description: this.description,
            timestamp: this.timestamp,
            context: this.context,
            stack: this.stack,
        };
    }
}
