'use client';

import { useCallback, useState } from 'react';
import type { NodeExecutionResult } from '@/types';

export interface ExecutionState {
    isConnected: boolean; // Not used in HTTP mod, but kept for compatibility
    isExecuting: boolean;
    nodeResults: NodeExecutionResult[];
    lastResult: { success: boolean; results: NodeExecutionResult[] } | null;
    error: string | null;
}

export function useExecution() {
    const [state, setState] = useState<ExecutionState>({
        isConnected: true, // Always true for HTTP
        isExecuting: false,
        nodeResults: [],
        lastResult: null,
        error: null,
    });

    const execute = useCallback(async (nodes: any[], edges: any[]) => {
        setState(prev => ({ ...prev, isExecuting: true, error: null, nodeResults: [] }));

        try {
            const token = localStorage.getItem('accessToken');
            const res = await fetch('/api/execute', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ nodes, edges }),
            });

            if (!res.ok) {
                throw new Error('Execution failed');
            }

            const data = await res.json();

            // In serverless, we get all results at once
            // To simulate "live" execution, we could animate this, 
            // but for now let's just set all results

            setState(prev => ({
                ...prev,
                isExecuting: false,
                lastResult: data,
                nodeResults: data.results || [],
            }));

        } catch (error) {
            console.error('Execute error:', error);
            setState(prev => ({
                ...prev,
                isExecuting: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            }));
        }
    }, []);

    const reset = useCallback(() => {
        setState({
            isConnected: true,
            isExecuting: false,
            nodeResults: [],
            lastResult: null,
            error: null,
        });
    }, []);

    return {
        ...state,
        execute,
        reset,
    };
}
