
import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import type { NodeExecutionResult } from '@/types';

export async function POST(req: NextRequest) {
    try {
        const user = getUserFromRequest(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { nodes, edges } = await req.json();

        // ----------------------------------------------------
        // SIMULATED EXECUTION ENGINE (Serverless Version)
        // ----------------------------------------------------
        // In a real app, this would be a complex engine.
        // For MVP, we iterate nodes and "execute" them.

        const results: NodeExecutionResult[] = [];

        // Sort nodes by execution order (naive implementation)
        // This is complex, so we just execution 'start' nodes and then their neighbors
        // For now, let's just "mock execute" all nodes to show visual feedback

        for (const node of nodes) {
            // Mock processing delay
            // await new Promise(r => setTimeout(r, 500)); 

            let outputData = { message: 'Node executed successfully' };
            let status = 'success';

            // Example Logic: If HTTP Request node
            if (node.type === 'httpRequest' && node.data?.parameters?.url) {
                try {
                    // Actual HTTP call could happen here
                    // const res = await fetch(node.data.parameters.url);
                    // outputData = await res.json();
                    outputData = {
                        url: node.data.parameters.url,
                        method: 'GET',
                        status: 200,
                        data: { mock: 'response' }
                    };
                } catch (e) {
                    status = 'error';
                }
            }

            results.push({
                nodeId: node.id,
                status: status as any,
                data: outputData,
                startedAt: new Date(),
                finishedAt: new Date(),
            });
        }

        return NextResponse.json({
            success: true,
            results,
        });

    } catch (error) {
        console.error('Execution error:', error);
        return NextResponse.json(
            { error: 'Execution failed', details: error instanceof Error ? error.message : 'Unknown' },
            { status: 500 }
        );
    }
}
