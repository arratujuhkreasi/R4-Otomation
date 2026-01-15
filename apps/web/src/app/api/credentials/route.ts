/**
 * GET/POST /api/credentials
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { encryptObject } from '@/lib/crypto';

export async function GET(req: NextRequest) {
    try {
        const user = getUserFromRequest(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const credentials = await prisma.credential.findMany({
            where: { userId: user.sub },
            select: {
                id: true,
                name: true,
                type: true,
                createdAt: true,
                updatedAt: true,
            },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json(credentials);
    } catch (error) {
        console.error('Get credentials error:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const user = getUserFromRequest(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { name, type, data } = await req.json();

        if (!name || !type || !data) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        const encryptedData = encryptObject(data);

        const credential = await prisma.credential.create({
            data: {
                userId: user.sub,
                name,
                type,
                data: encryptedData,
            },
            select: {
                id: true,
                name: true,
                type: true,
                createdAt: true,
            },
        });

        return NextResponse.json(credential);
    } catch (error) {
        console.error('Create credential error:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
