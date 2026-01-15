'use client';

import { useMemo } from 'react';
import type { NodeExecutionResult } from '@flowautomator/shared-types';

interface ExecutionResultsPanelProps {
    isConnected: boolean;
    isExecuting: boolean;
    nodeResults: NodeExecutionResult[];
    error: string | null;
}

export default function ExecutionResultsPanel({
    isConnected,
    isExecuting,
    nodeResults,
    error,
}: ExecutionResultsPanelProps) {
    const statusColor = useMemo(() => {
        if (!isConnected) return 'bg-gray-500';
        if (isExecuting) return 'bg-yellow-500 animate-pulse';
        if (error) return 'bg-red-500';
        if (nodeResults.length > 0) return 'bg-green-500';
        return 'bg-emerald-500';
    }, [isConnected, isExecuting, error, nodeResults.length]);

    return (
        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-200 dark:border-slate-700 w-80 max-h-[500px] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
                <h3 className="font-semibold text-gray-800 dark:text-gray-200">
                    Execution Results
                </h3>
                <div className="flex items-center gap-2">
                    <span
                        className={`w-2.5 h-2.5 rounded-full ${statusColor}`}
                        title={isConnected ? 'Connected' : 'Disconnected'}
                    />
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                        {isConnected ? 'Live' : 'Offline'}
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {/* Error message */}
                {error && (
                    <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-3 py-2 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                {/* Executing indicator */}
                {isExecuting && (
                    <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                                fill="none"
                            />
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                            />
                        </svg>
                        <span className="text-sm font-medium">Executing workflow...</span>
                    </div>
                )}

                {/* Node results */}
                {nodeResults.length === 0 && !isExecuting && !error && (
                    <p className="text-gray-400 dark:text-gray-500 text-sm text-center py-4">
                        Click &quot;Execute&quot; to run the workflow
                    </p>
                )}

                {nodeResults.map((result, index) => (
                    <div
                        key={result.nodeId}
                        className={`rounded-lg border p-3 ${result.status === 'success'
                            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                            : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                            }`}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-sm text-gray-800 dark:text-gray-200">
                                Node {index + 1}: {result.nodeId.substring(0, 8)}...
                            </span>
                            <span
                                className={`text-xs px-2 py-0.5 rounded-full ${result.status === 'success'
                                    ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                                    : 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
                                    }`}
                            >
                                {result.status}
                            </span>
                        </div>

                        {result.error && (
                            <p className="text-red-600 dark:text-red-400 text-xs">
                                {result.error}
                            </p>
                        )}

                        {result.data !== undefined && result.data !== null && (
                            <pre className="text-xs bg-gray-900 text-gray-100 p-2 rounded mt-2 overflow-x-auto max-h-32">
                                {typeof result.data === 'object'
                                    ? JSON.stringify(result.data, null, 2)
                                    : String(result.data)}
                            </pre>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
