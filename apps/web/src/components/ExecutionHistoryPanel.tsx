'use client';

import { useState, useEffect } from 'react';

interface ExecutionResult {
    id: string;
    workflowId: string;
    workflowName: string;
    status: 'pending' | 'running' | 'success' | 'error';
    startedAt: string;
    finishedAt?: string;
    duration?: number;
    nodeResults: Array<{
        nodeId: string;
        nodeName: string;
        status: string;
        data?: unknown;
        error?: string;
    }>;
}

export default function ExecutionHistoryPanel() {
    const [executions, setExecutions] = useState<ExecutionResult[]>([]);
    const [selectedExecution, setSelectedExecution] = useState<ExecutionResult | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchExecutions();
    }, []);

    const fetchExecutions = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/executions`);
            const data = await res.json();
            setExecutions(data || []);
        } catch (error) {
            console.error('Failed to fetch executions:', error);
            // Demo data
            setExecutions([
                {
                    id: '1',
                    workflowId: 'wf1',
                    workflowName: 'Tokopedia Order Sync',
                    status: 'success',
                    startedAt: new Date(Date.now() - 60000).toISOString(),
                    finishedAt: new Date(Date.now() - 55000).toISOString(),
                    duration: 5000,
                    nodeResults: [
                        { nodeId: 'n1', nodeName: 'Tokopedia', status: 'success', data: { orders: 5 } },
                        { nodeId: 'n2', nodeName: 'Google Sheets', status: 'success', data: { rows: 5 } },
                    ],
                },
                {
                    id: '2',
                    workflowId: 'wf2',
                    workflowName: 'Instagram Auto Reply',
                    status: 'error',
                    startedAt: new Date(Date.now() - 120000).toISOString(),
                    finishedAt: new Date(Date.now() - 118000).toISOString(),
                    duration: 2000,
                    nodeResults: [
                        { nodeId: 'n1', nodeName: 'Instagram', status: 'error', error: 'Rate limit exceeded' },
                    ],
                },
                {
                    id: '3',
                    workflowId: 'wf1',
                    workflowName: 'Tokopedia Order Sync',
                    status: 'running',
                    startedAt: new Date().toISOString(),
                    nodeResults: [],
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'success': return 'text-green-400 bg-green-400/10';
            case 'error': return 'text-red-400 bg-red-400/10';
            case 'running': return 'text-blue-400 bg-blue-400/10';
            default: return 'text-n8n-text-dim bg-n8n-bg-dark';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'success':
                return (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                );
            case 'error':
                return (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                );
            case 'running':
                return (
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                );
            default:
                return null;
        }
    };

    const formatDuration = (ms?: number) => {
        if (!ms) return '-';
        if (ms < 1000) return `${ms}ms`;
        return `${(ms / 1000).toFixed(1)}s`;
    };

    const formatTime = (iso: string) => {
        return new Date(iso).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    };

    return (
        <div className="h-full flex flex-col bg-n8n-bg-darker">
            {/* Header */}
            <div className="px-4 py-3 border-b border-n8n-border">
                <h2 className="font-semibold text-n8n-text">Execution History</h2>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto">
                {loading ? (
                    <div className="flex items-center justify-center h-32">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-n8n-primary"></div>
                    </div>
                ) : executions.length === 0 ? (
                    <div className="p-4 text-center text-n8n-text-dim">
                        No executions yet
                    </div>
                ) : (
                    <div className="divide-y divide-n8n-border">
                        {executions.map((execution) => (
                            <button
                                key={execution.id}
                                onClick={() => setSelectedExecution(execution)}
                                className={`w-full p-3 text-left hover:bg-n8n-bg-dark transition-colors ${selectedExecution?.id === execution.id ? 'bg-n8n-bg-dark' : ''
                                    }`}
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm font-medium text-n8n-text truncate">
                                        {execution.workflowName}
                                    </span>
                                    <span className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs ${getStatusColor(execution.status)}`}>
                                        {getStatusIcon(execution.status)}
                                        {execution.status}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 text-xs text-n8n-text-dim">
                                    <span>{formatTime(execution.startedAt)}</span>
                                    <span>{formatDuration(execution.duration)}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Details Panel */}
            {selectedExecution && (
                <div className="border-t border-n8n-border p-4 max-h-64 overflow-y-auto">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium text-n8n-text">Execution Details</h3>
                        <button
                            onClick={() => setSelectedExecution(null)}
                            className="text-n8n-text-dim hover:text-n8n-text"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="space-y-2">
                        {selectedExecution.nodeResults.map((result, index) => (
                            <div
                                key={index}
                                className={`p-2 rounded-lg ${result.status === 'success' ? 'bg-green-500/10' :
                                        result.status === 'error' ? 'bg-red-500/10' : 'bg-n8n-bg-dark'
                                    }`}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-n8n-text">{result.nodeName}</span>
                                    <span className={`text-xs ${result.status === 'success' ? 'text-green-400' :
                                            result.status === 'error' ? 'text-red-400' : 'text-n8n-text-dim'
                                        }`}>
                                        {result.status}
                                    </span>
                                </div>
                                {result.error && (
                                    <p className="text-xs text-red-400 mt-1">{result.error}</p>
                                )}
                                {result.data && (
                                    <pre className="text-[10px] text-n8n-text-dim mt-1 overflow-x-auto">
                                        {JSON.stringify(result.data, null, 2)}
                                    </pre>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
