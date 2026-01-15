import { Controller, Post, Get, Param, Body } from '@nestjs/common';
import { ExecutionService } from './execution.service';
import type { WorkflowExecution } from '@flowautomator/shared-types';

@Controller('executions')
export class ExecutionController {
    constructor(private readonly executionService: ExecutionService) { }

    /**
     * Execute a workflow
     */
    @Post('run/:workflowId')
    async executeWorkflow(
        @Param('workflowId') workflowId: string,
    ): Promise<WorkflowExecution> {
        return this.executionService.executeWorkflow(workflowId);
    }

    /**
     * Get execution by ID
     */
    @Get(':executionId')
    async getExecution(
        @Param('executionId') executionId: string,
    ): Promise<WorkflowExecution | null> {
        return this.executionService.getExecution(executionId);
    }

    /**
     * Get all executions for a workflow
     */
    @Get('workflow/:workflowId')
    async getWorkflowExecutions(
        @Param('workflowId') workflowId: string,
    ): Promise<WorkflowExecution[]> {
        return this.executionService.getWorkflowExecutions(workflowId);
    }
}
