import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma';
import type { Workflow, WorkflowNode, WorkflowEdge } from '@flowautomator/shared-types';

interface CreateWorkflowDto {
    name: string;
    description?: string;
    nodes: WorkflowNode[];
    edges: WorkflowEdge[];
    active?: boolean;
}

@Injectable()
export class WorkflowsService {
    constructor(private readonly prisma: PrismaService) { }

    async findAll(): Promise<Workflow[]> {
        const workflows = await this.prisma.workflow.findMany({
            orderBy: { updatedAt: 'desc' },
        });

        return workflows.map((w: any) => this.mapToWorkflow(w));
    }

    async findOne(id: string): Promise<Workflow | null> {
        const workflow = await this.prisma.workflow.findUnique({
            where: { id },
        });

        return workflow ? this.mapToWorkflow(workflow) : null;
    }

    async create(data: CreateWorkflowDto): Promise<Workflow> {
        const workflow = await this.prisma.workflow.create({
            data: {
                name: data.name,
                description: data.description,
                nodes: data.nodes as any,
                edges: data.edges as any,
                active: data.active ?? false,
            },
        });

        return this.mapToWorkflow(workflow);
    }

    async update(id: string, data: Partial<CreateWorkflowDto>): Promise<Workflow> {
        const workflow = await this.prisma.workflow.update({
            where: { id },
            data: {
                ...(data.name && { name: data.name }),
                ...(data.description !== undefined && { description: data.description }),
                ...(data.nodes && { nodes: data.nodes as any }),
                ...(data.edges && { edges: data.edges as any }),
                ...(data.active !== undefined && { active: data.active }),
            },
        });

        return this.mapToWorkflow(workflow);
    }

    async delete(id: string): Promise<void> {
        await this.prisma.workflow.delete({
            where: { id },
        });
    }

    private mapToWorkflow(workflow: any): Workflow {
        return {
            id: workflow.id,
            name: workflow.name,
            description: workflow.description,
            nodes: workflow.nodes as WorkflowNode[],
            edges: workflow.edges as WorkflowEdge[],
            active: workflow.active,
            createdAt: workflow.createdAt,
            updatedAt: workflow.updatedAt,
        };
    }
}
