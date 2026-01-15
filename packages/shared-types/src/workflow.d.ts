export interface WorkflowNode {
    id: string;
    type: string;
    position: {
        x: number;
        y: number;
    };
    data: {
        parameters: Record<string, unknown>;
        credentialsId?: string;
        label?: string;
    };
}
export interface WorkflowEdge {
    id: string;
    source: string;
    target: string;
    sourceHandle?: string;
    targetHandle?: string;
}
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
export type WorkflowExecutionStatus = 'pending' | 'running' | 'success' | 'error' | 'cancelled';
export interface NodeExecutionResult {
    nodeId: string;
    status: WorkflowExecutionStatus;
    data?: unknown;
    error?: string;
    startedAt: Date;
    finishedAt?: Date;
}
export interface WorkflowExecution {
    id: string;
    workflowId: string;
    status: WorkflowExecutionStatus;
    nodeResults: NodeExecutionResult[];
    startedAt: Date;
    finishedAt?: Date;
    triggeredBy: 'manual' | 'webhook' | 'cron';
}
