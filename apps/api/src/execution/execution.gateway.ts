import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    MessageBody,
    ConnectedSocket,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { ExecutionService } from './execution.service';
import type { WorkflowNode, WorkflowEdge, NodeExecutionResult } from '@flowautomator/shared-types';

interface ExecuteWorkflowPayload {
    nodes: WorkflowNode[];
    edges: WorkflowEdge[];
    workflowName?: string;
}

@WebSocketGateway({
    cors: {
        origin: 'http://localhost:3005',
        credentials: true,
    },
    namespace: '/execution',
})
export class ExecutionGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server!: Server;

    private readonly logger = new Logger(ExecutionGateway.name);

    constructor(private readonly executionService: ExecutionService) { }

    handleConnection(client: Socket) {
        this.logger.log(`Client connected: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        this.logger.log(`Client disconnected: ${client.id}`);
    }

    /**
     * Execute a workflow from frontend JSON
     */
    @SubscribeMessage('execute')
    async handleExecute(
        @MessageBody() payload: ExecuteWorkflowPayload,
        @ConnectedSocket() client: Socket,
    ) {
        this.logger.log(`Received execute request from ${client.id}`);

        try {
            // Emit start event
            client.emit('execution:start', {
                message: 'Workflow execution started',
                timestamp: new Date(),
            });

            // Execute workflow directly from payload
            const result = await this.executionService.executeFromPayload(
                payload.nodes,
                payload.edges,
                (nodeResult: NodeExecutionResult) => {
                    // Emit progress for each node
                    client.emit('execution:node-complete', nodeResult);
                },
            );

            // Emit completion
            client.emit('execution:complete', result);

            return result;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.logger.error(`Execution failed: ${errorMessage}`);

            client.emit('execution:error', {
                error: errorMessage,
                timestamp: new Date(),
            });

            return { error: errorMessage };
        }
    }
}
