/**
 * WorkflowNode - Core interface for all workflow nodes
 * Every node must follow this strict interface as defined in the architecture.
 */
export interface WorkflowNode {
    /** Unique identifier for the node */
    id: string;

    /** Node type - e.g., 'httpRequest', 'webhook', 'cron', 'code' */
    type: string;

    /** Position on the canvas */
    position: {
        x: number;
        y: number;
    };

    /** Node-specific data */
    data: {
        /** User-configurable parameters (URLs, Headers, etc.) */
        parameters: Record<string, unknown>;
        /** Optional reference to stored credentials */
        credentialsId?: string;
        /** Display label for the node */
        label?: string;
    };
}

/**
 * WorkflowEdge - Connection between two nodes
 */
export interface WorkflowEdge {
    id: string;
    source: string;
    target: string;
    sourceHandle?: string;
    targetHandle?: string;
}

/**
 * Workflow - Complete workflow definition
 */
export interface Workflow {
    id: string;
    name: string;
    description?: string;
    nodes: WorkflowNode[];
    edges: WorkflowEdge[];
    active: boolean;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * WorkflowExecutionStatus - Possible execution states
 */
export type WorkflowExecutionStatus =
    | 'pending'
    | 'running'
    | 'success'
    | 'error'
    | 'cancelled';

/**
 * NodeExecutionResult - Result of executing a single node
 */
export interface NodeExecutionResult {
    nodeId: string;
    status: WorkflowExecutionStatus;
    data?: unknown;
    error?: string;
    startedAt: Date;
    finishedAt?: Date;
}

/**
 * WorkflowExecution - Complete execution record
 */
export interface WorkflowExecution {
    id: string;
    workflowId: string;
    status: WorkflowExecutionStatus;
    nodeResults: NodeExecutionResult[];
    startedAt: Date;
    finishedAt?: Date;
    triggeredBy: 'manual' | 'webhook' | 'cron';
}
