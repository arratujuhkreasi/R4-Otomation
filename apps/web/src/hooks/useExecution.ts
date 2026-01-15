'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import type { NodeExecutionResult } from '@flowautomator/shared-types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface ExecutionState {
    isConnected: boolean;
    isExecuting: boolean;
    nodeResults: NodeExecutionResult[];
    lastResult: { success: boolean; results: NodeExecutionResult[] } | null;
    error: string | null;
}

export function useExecution() {
    const socketRef = useRef<Socket | null>(null);
    const [state, setState] = useState<ExecutionState>({
        isConnected: false,
        isExecuting: false,
        nodeResults: [],
        lastResult: null,
        error: null,
    });

    // Connect to WebSocket
    useEffect(() => {
        const socket = io(`${API_URL}/execution`, {
            transports: ['websocket', 'polling'],
            withCredentials: true,
        });

        socket.on('connect', () => {
            console.log('🔌 WebSocket connected');
            setState((prev) => ({ ...prev, isConnected: true }));
        });

        socket.on('disconnect', () => {
            console.log('🔌 WebSocket disconnected');
            setState((prev) => ({ ...prev, isConnected: false }));
        });

        socket.on('execution:start', (data) => {
            console.log('▶️ Execution started:', data);
            setState((prev) => ({
                ...prev,
                isExecuting: true,
                nodeResults: [],
                error: null,
            }));
        });

        socket.on('execution:node-complete', (nodeResult: NodeExecutionResult) => {
            console.log('✅ Node complete:', nodeResult);
            setState((prev) => ({
                ...prev,
                nodeResults: [...prev.nodeResults, nodeResult],
            }));
        });

        socket.on('execution:complete', (result) => {
            console.log('🏁 Execution complete:', result);
            setState((prev) => ({
                ...prev,
                isExecuting: false,
                lastResult: result,
            }));
        });

        socket.on('execution:error', (data) => {
            console.error('❌ Execution error:', data);
            setState((prev) => ({
                ...prev,
                isExecuting: false,
                error: data.error,
            }));
        });

        socketRef.current = socket;

        return () => {
            socket.disconnect();
        };
    }, []);

    // Execute workflow
    const execute = useCallback(
        (nodes: any[], edges: any[]) => {
            if (!socketRef.current?.connected) {
                setState((prev) => ({
                    ...prev,
                    error: 'Not connected to server',
                }));
                return;
            }

            // Transform nodes to match backend expected format
            const transformedNodes = nodes.map((node) => ({
                id: node.id,
                type: node.type,
                position: node.position,
                data: {
                    parameters: {
                        url: node.data.url,
                        method: 'GET',
                    },
                    label: node.data.label,
                },
            }));

            socketRef.current.emit('execute', {
                nodes: transformedNodes,
                edges,
            });
        },
        [],
    );

    // Reset state
    const reset = useCallback(() => {
        setState({
            isConnected: socketRef.current?.connected ?? false,
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
