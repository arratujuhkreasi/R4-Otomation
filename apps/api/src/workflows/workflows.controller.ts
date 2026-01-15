import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import type { Workflow, WorkflowNode, WorkflowEdge } from '@flowautomator/shared-types';
import { WorkflowsService } from './workflows.service';

interface CreateWorkflowDto {
    name: string;
    description?: string;
    nodes: WorkflowNode[];
    edges: WorkflowEdge[];
    active?: boolean;
}

@Controller('workflows')
export class WorkflowsController {
    constructor(private readonly workflowsService: WorkflowsService) { }

    @Get()
    async findAll(): Promise<Workflow[]> {
        return this.workflowsService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id') id: string): Promise<Workflow | null> {
        return this.workflowsService.findOne(id);
    }

    @Post()
    async create(@Body() data: CreateWorkflowDto): Promise<Workflow> {
        return this.workflowsService.create(data);
    }

    @Put(':id')
    async update(
        @Param('id') id: string,
        @Body() data: Partial<CreateWorkflowDto>,
    ): Promise<Workflow> {
        return this.workflowsService.update(id, data);
    }

    @Delete(':id')
    async delete(@Param('id') id: string): Promise<void> {
        return this.workflowsService.delete(id);
    }
}
