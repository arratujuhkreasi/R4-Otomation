import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma';
import { HttpRequestExecutor } from './executors/http-request.executor';
import type {
    Workflow,
    WorkflowNode,
    WorkflowEdge,
    WorkflowExecution,
    NodeExecutionResult,
    WorkflowExecutionStatus,
} from '@flowautomator/shared-types';

interface ExecutionContext {
    executionId: string;
    workflowId: string;
    nodeResults: Map<string, NodeExecutionResult>;
    previousNodeData: unknown;
}

@Injectable()
export class ExecutionService {
    private readonly logger = new Logger(ExecutionService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly httpRequestExecutor: HttpRequestExecutor,
    ) { }

    /**
     * Execute a workflow by ID
     */
    async executeWorkflow(workflowId: string): Promise<WorkflowExecution> {
        // Fetch workflow from database
        const workflow = await this.prisma.workflow.findUnique({
            where: { id: workflowId },
        });

        if (!workflow) {
            throw new Error(`Workflow ${workflowId} not found`);
        }

        // Create execution record
        const execution = await this.prisma.execution.create({
            data: {
                workflowId,
                status: 'RUNNING',
                triggeredBy: 'MANUAL',
            },
        });

        this.logger.log(`Starting execution ${execution.id} for workflow ${workflowId}`);

        try {
            // Parse workflow structure
            const nodes = workflow.nodes as unknown as WorkflowNode[];
            const edges = workflow.edges as unknown as WorkflowEdge[];

            // Execute the workflow chain
            const nodeResults = await this.executeNodeChain(
                nodes,
                edges,
                {
                    executionId: execution.id,
                    workflowId,
                    nodeResults: new Map(),
                    previousNodeData: null,
                },
            );

            // Update execution as successful
            const updatedExecution = await this.prisma.execution.update({
                where: { id: execution.id },
                data: {
                    status: 'SUCCESS',
                    nodeResults: Array.from(nodeResults.values()) as any,
                    finishedAt: new Date(),
                },
            });

            this.logger.log(`Execution ${execution.id} completed successfully`);

            return this.mapToWorkflowExecution(updatedExecution);
        } catch (error) {
            // Update execution as failed
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';

            await this.prisma.execution.update({
                where: { id: execution.id },
                data: {
                    status: 'ERROR',
                    error: errorMessage,
                    finishedAt: new Date(),
                },
            });

            this.logger.error(`Execution ${execution.id} failed: ${errorMessage}`);
            throw error;
        }
    }

    /**
     * Execute a workflow directly from payload (for WebSocket)
     */
    async executeFromPayload(
        nodes: WorkflowNode[],
        edges: WorkflowEdge[],
        onNodeComplete?: (result: NodeExecutionResult) => void,
    ): Promise<{ success: boolean; results: NodeExecutionResult[] }> {
        this.logger.log(`Executing workflow from payload with ${nodes.length} nodes`);

        try {
            const results = await this.executeNodeChainWithCallback(
                nodes,
                edges,
                onNodeComplete,
            );

            return {
                success: true,
                results: Array.from(results.values()),
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.logger.error(`Payload execution failed: ${errorMessage}`);
            throw error;
        }
    }

    /**
     * Execute nodes with callback for each completed node
     */
    private async executeNodeChainWithCallback(
        nodes: WorkflowNode[],
        edges: WorkflowEdge[],
        onNodeComplete?: (result: NodeExecutionResult) => void,
    ): Promise<Map<string, NodeExecutionResult>> {
        const nodeResults = new Map<string, NodeExecutionResult>();
        let previousNodeData: unknown = null;

        // Build adjacency list
        const incomingEdges = new Map<string, string[]>();
        const outgoingEdges = new Map<string, string[]>();

        for (const node of nodes) {
            incomingEdges.set(node.id, []);
            outgoingEdges.set(node.id, []);
        }

        for (const edge of edges) {
            const incoming = incomingEdges.get(edge.target) || [];
            incoming.push(edge.source);
            incomingEdges.set(edge.target, incoming);

            const outgoing = outgoingEdges.get(edge.source) || [];
            outgoing.push(edge.target);
            outgoingEdges.set(edge.source, outgoing);
        }

        // Find starting nodes
        const startNodes = nodes.filter(
            (node) => (incomingEdges.get(node.id) || []).length === 0,
        );

        if (startNodes.length === 0 && nodes.length > 0) {
            throw new Error('No starting node found in workflow');
        }

        // Execute in topological order
        const visited = new Set<string>();
        const queue: WorkflowNode[] = [...startNodes];

        while (queue.length > 0) {
            const currentNode = queue.shift()!;

            if (visited.has(currentNode.id)) continue;

            const dependencies = incomingEdges.get(currentNode.id) || [];
            const allDependenciesMet = dependencies.every((depId) => visited.has(depId));

            if (!allDependenciesMet) {
                queue.push(currentNode);
                continue;
            }

            // Execute node
            const result = await this.executeNodeDirect(currentNode, previousNodeData);
            nodeResults.set(currentNode.id, result);
            previousNodeData = result.data;
            visited.add(currentNode.id);

            // Emit progress callback
            if (onNodeComplete) {
                onNodeComplete(result);
            }

            // Queue next nodes
            const nextNodeIds = outgoingEdges.get(currentNode.id) || [];
            for (const nextId of nextNodeIds) {
                const nextNode = nodes.find((n) => n.id === nextId);
                if (nextNode && !visited.has(nextId)) {
                    queue.push(nextNode);
                }
            }
        }

        return nodeResults;
    }

    /**
     * Execute a single node directly (without context)
     */
    private async executeNodeDirect(
        node: WorkflowNode,
        previousData: unknown,
    ): Promise<NodeExecutionResult> {
        const startedAt = new Date();
        this.logger.debug(`Executing node ${node.id} (type: ${node.type})`);

        try {
            let data: unknown;

            switch (node.type) {
                case 'start':
                    data = previousData || {};
                    break;

                case 'httpRequest':
                case 'actionNode':
                    data = await this.httpRequestExecutor.execute(
                        node.data.parameters,
                        previousData,
                    );
                    break;

                default:
                    this.logger.warn(`Unknown node type: ${node.type}, passing through`);
                    data = previousData;
            }

            return {
                nodeId: node.id,
                status: 'success' as WorkflowExecutionStatus,
                data,
                startedAt,
                finishedAt: new Date(),
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            return {
                nodeId: node.id,
                status: 'error' as WorkflowExecutionStatus,
                error: errorMessage,
                startedAt,
                finishedAt: new Date(),
            };
        }
    }

    /**
     * Execute nodes in chain order (topological sort based on edges)
     */
    private async executeNodeChain(
        nodes: WorkflowNode[],
        edges: WorkflowEdge[],
        context: ExecutionContext,
    ): Promise<Map<string, NodeExecutionResult>> {
        // Build adjacency list and find starting nodes (no incoming edges)
        const incomingEdges = new Map<string, string[]>();
        const outgoingEdges = new Map<string, string[]>();

        // Initialize
        for (const node of nodes) {
            incomingEdges.set(node.id, []);
            outgoingEdges.set(node.id, []);
        }

        // Populate edge maps
        for (const edge of edges) {
            const incoming = incomingEdges.get(edge.target) || [];
            incoming.push(edge.source);
            incomingEdges.set(edge.target, incoming);

            const outgoing = outgoingEdges.get(edge.source) || [];
            outgoing.push(edge.target);
            outgoingEdges.set(edge.source, outgoing);
        }

        // Find starting nodes (no incoming edges)
        const startNodes = nodes.filter(
            (node) => (incomingEdges.get(node.id) || []).length === 0,
        );

        if (startNodes.length === 0 && nodes.length > 0) {
            throw new Error('No starting node found in workflow');
        }

        // Execute nodes in topological order using BFS
        const visited = new Set<string>();
        const queue: WorkflowNode[] = [...startNodes];

        while (queue.length > 0) {
            const currentNode = queue.shift()!;

            if (visited.has(currentNode.id)) {
                continue;
            }

            // Check if all dependencies are satisfied
            const dependencies = incomingEdges.get(currentNode.id) || [];
            const allDependenciesMet = dependencies.every((depId) => visited.has(depId));

            if (!allDependenciesMet) {
                // Re-queue for later
                queue.push(currentNode);
                continue;
            }

            // Execute the node
            const result = await this.executeNode(currentNode, context);
            context.nodeResults.set(currentNode.id, result);
            context.previousNodeData = result.data;
            visited.add(currentNode.id);

            // Queue next nodes
            const nextNodeIds = outgoingEdges.get(currentNode.id) || [];
            for (const nextId of nextNodeIds) {
                const nextNode = nodes.find((n) => n.id === nextId);
                if (nextNode && !visited.has(nextId)) {
                    queue.push(nextNode);
                }
            }
        }

        return context.nodeResults;
    }

    /**
     * Execute a single node based on its type
     */
    private async executeNode(
        node: WorkflowNode,
        context: ExecutionContext,
    ): Promise<NodeExecutionResult> {
        const startedAt = new Date();

        this.logger.debug(`Executing node ${node.id} (type: ${node.type})`);

        try {
            let data: unknown;

            switch (node.type) {
                case 'start':
                    // Start node just passes through
                    data = context.previousNodeData || {};
                    break;

                case 'httpRequest':
                case 'actionNode':
                    data = await this.httpRequestExecutor.execute(
                        node.data.parameters,
                        context.previousNodeData,
                    );
                    break;

                default:
                    this.logger.warn(`Unknown node type: ${node.type}, skipping`);
                    data = context.previousNodeData;
            }

            return {
                nodeId: node.id,
                status: 'success' as WorkflowExecutionStatus,
                data,
                startedAt,
                finishedAt: new Date(),
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';

            return {
                nodeId: node.id,
                status: 'error' as WorkflowExecutionStatus,
                error: errorMessage,
                startedAt,
                finishedAt: new Date(),
            };
        }
    }

    /**
     * Get execution by ID
     */
    async getExecution(executionId: string): Promise<WorkflowExecution | null> {
        const execution = await this.prisma.execution.findUnique({
            where: { id: executionId },
        });

        return execution ? this.mapToWorkflowExecution(execution) : null;
    }

    /**
     * Get all executions for a workflow
     */
    async getWorkflowExecutions(workflowId: string): Promise<WorkflowExecution[]> {
        const executions = await this.prisma.execution.findMany({
            where: { workflowId },
            orderBy: { startedAt: 'desc' },
        });

        return executions.map((e: any) => this.mapToWorkflowExecution(e));
    }

    private mapToWorkflowExecution(execution: any): WorkflowExecution {
        return {
            id: execution.id,
            workflowId: execution.workflowId,
            status: execution.status.toLowerCase() as WorkflowExecutionStatus,
            nodeResults: execution.nodeResults as NodeExecutionResult[],
            startedAt: execution.startedAt,
            finishedAt: execution.finishedAt,
            triggeredBy: execution.triggeredBy.toLowerCase() as 'manual' | 'webhook' | 'cron',
        };
    }
}
