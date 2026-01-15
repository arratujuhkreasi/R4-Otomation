/**
 * GET/POST /api/workflows
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
    try {
        const user = getUserFromRequest(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const workflows = await prisma.workflow.findMany({
            where: { userId: user.sub },
            select: {
                id: true,
                name: true,
                description: true,
                active: true,
                createdAt: true,
                updatedAt: true,
            },
            orderBy: { updatedAt: 'desc' },
        });

        return NextResponse.json(workflows);
    } catch (error) {
        console.error('Get workflows error:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const user = getUserFromRequest(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { name, description, nodes = [], edges = [] } = await req.json();

        if (!name) {
            return NextResponse.json({ error: 'Name required' }, { status: 400 });
        }

        const workflow = await prisma.workflow.create({
            data: {
                userId: user.sub,
                name,
                description,
                nodes,
                edges,
            },
        });

        return NextResponse.json(workflow);
    } catch (error) {
        console.error('Create workflow error:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
