'use client';

import { useMemo } from 'react';

interface ConfigPanelProps {
    selectedNode: {
        id: string;
        type: string;
        data: Record<string, any>;
    } | null;
    onUpdateNode: (nodeId: string, data: Record<string, any>) => void;
    executionResults: {
        nodeId: string;
        status: string;
        data?: any;
        error?: string;
    }[];
}

export default function ConfigPanel({ selectedNode, onUpdateNode, executionResults }: ConfigPanelProps) {
    const nodeResult = useMemo(() => {
        if (!selectedNode) return null;
        return executionResults.find((r) => r.nodeId === selectedNode.id);
    }, [selectedNode, executionResults]);

    if (!selectedNode) {
        return (
            <div className="w-80 h-full n8n-panel border-l border-n8n-border flex flex-col">
                <div className="flex-1 flex items-center justify-center p-8">
                    <div className="text-center">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-n8n-bg-card flex items-center justify-center">
                            <svg className="w-8 h-8 text-n8n-text-dim" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                            </svg>
                        </div>
                        <h3 className="text-n8n-text font-medium mb-2">No node selected</h3>
                        <p className="text-n8n-text-dim text-sm">
                            Select a node to view and edit its configuration
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    const getNodeColor = (type: string) => {
        if (type.includes('trigger') || type.includes('webhook') || type.includes('schedule')) {
            return 'bg-n8n-node-trigger';
        }
        if (type.includes('http') || type.includes('request')) {
            return 'bg-n8n-node-action';
        }
        if (type.includes('if') || type.includes('switch') || type.includes('merge')) {
            return 'bg-n8n-node-logic';
        }
        if (type.includes('set') || type.includes('code')) {
            return 'bg-n8n-node-transform';
        }
        return 'bg-n8n-node-action';
    };

    const getNodeLabel = (type: string) => {
        const labels: Record<string, string> = {
            triggerNode: 'Webhook Trigger',
            scheduleNode: 'Schedule Trigger',
            manualTrigger: 'Manual Trigger',
            httpRequestNode: 'HTTP Request',
            ifNode: 'IF Condition',
            switchNode: 'Switch',
            mergeNode: 'Merge',
            setNode: 'Set',
            codeNode: 'Code',
            actionNode: 'Action',
        };
        return labels[type] || type;
    };

    return (
        <div className="w-80 h-full n8n-panel border-l border-n8n-border flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-n8n-border">
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg ${getNodeColor(selectedNode.type)} flex items-center justify-center`}>
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-n8n-text font-semibold">{getNodeLabel(selectedNode.type)}</h3>
                        <p className="text-n8n-text-dim text-xs">ID: {selectedNode.id.substring(0, 12)}...</p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-n8n-border">
                <button className="flex-1 py-3 text-sm font-medium text-n8n-primary border-b-2 border-n8n-primary">
                    Parameters
                </button>
                <button className="flex-1 py-3 text-sm font-medium text-n8n-text-muted hover:text-n8n-text">
                    Settings
                </button>
                <button className="flex-1 py-3 text-sm font-medium text-n8n-text-muted hover:text-n8n-text relative">
                    Output
                    {nodeResult && (
                        <span className={`absolute top-2 right-2 w-2 h-2 rounded-full ${nodeResult.status === 'success' ? 'bg-n8n-success' : 'bg-n8n-error'
                            }`} />
                    )}
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Label field */}
                <div>
                    <label className="block text-xs font-medium text-n8n-text-muted mb-1.5 uppercase tracking-wide">
                        Label
                    </label>
                    <input
                        type="text"
                        value={selectedNode.data.label || ''}
                        onChange={(e) => onUpdateNode(selectedNode.id, { label: e.target.value })}
                        className="n8n-input"
                        placeholder="Enter node label..."
                    />
                </div>

                {/* Type-specific fields */}
                {(selectedNode.type.includes('http') || selectedNode.type === 'actionNode') && (
                    <>
                        <div>
                            <label className="block text-xs font-medium text-n8n-text-muted mb-1.5 uppercase tracking-wide">
                                Method
                            </label>
                            <select
                                value={selectedNode.data.method || 'GET'}
                                onChange={(e) => onUpdateNode(selectedNode.id, { method: e.target.value })}
                                className="n8n-input"
                            >
                                <option value="GET">GET</option>
                                <option value="POST">POST</option>
                                <option value="PUT">PUT</option>
                                <option value="PATCH">PATCH</option>
                                <option value="DELETE">DELETE</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-n8n-text-muted mb-1.5 uppercase tracking-wide">
                                URL
                            </label>
                            <input
                                type="url"
                                value={selectedNode.data.url || ''}
                                onChange={(e) => onUpdateNode(selectedNode.id, { url: e.target.value })}
                                className="n8n-input"
                                placeholder="https://api.example.com"
                            />
                        </div>
                    </>
                )}

                {selectedNode.type.includes('if') && (
                    <>
                        <div>
                            <label className="block text-xs font-medium text-n8n-text-muted mb-1.5 uppercase tracking-wide">
                                Condition
                            </label>
                            <input
                                type="text"
                                value={selectedNode.data.condition || ''}
                                onChange={(e) => onUpdateNode(selectedNode.id, { condition: e.target.value })}
                                className="n8n-input"
                                placeholder="{{ $json.value }} === true"
                            />
                        </div>
                    </>
                )}

                {selectedNode.type.includes('code') && (
                    <>
                        <div>
                            <label className="block text-xs font-medium text-n8n-text-muted mb-1.5 uppercase tracking-wide">
                                JavaScript Code
                            </label>
                            <textarea
                                value={selectedNode.data.code || ''}
                                onChange={(e) => onUpdateNode(selectedNode.id, { code: e.target.value })}
                                className="n8n-input font-mono text-xs"
                                rows={8}
                                placeholder="// Your code here&#10;return items;"
                            />
                        </div>
                    </>
                )}

                {selectedNode.type.includes('set') && (
                    <>
                        <div>
                            <label className="block text-xs font-medium text-n8n-text-muted mb-1.5 uppercase tracking-wide">
                                Field Name
                            </label>
                            <input
                                type="text"
                                value={selectedNode.data.fieldName || ''}
                                onChange={(e) => onUpdateNode(selectedNode.id, { fieldName: e.target.value })}
                                className="n8n-input"
                                placeholder="myField"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-n8n-text-muted mb-1.5 uppercase tracking-wide">
                                Value
                            </label>
                            <input
                                type="text"
                                value={selectedNode.data.fieldValue || ''}
                                onChange={(e) => onUpdateNode(selectedNode.id, { fieldValue: e.target.value })}
                                className="n8n-input"
                                placeholder="{{ $json.data }}"
                            />
                        </div>
                    </>
                )}

                {(selectedNode.type.includes('trigger') || selectedNode.type.includes('webhook')) && (
                    <>
                        <div>
                            <label className="block text-xs font-medium text-n8n-text-muted mb-1.5 uppercase tracking-wide">
                                Webhook Path
                            </label>
                            <input
                                type="text"
                                value={selectedNode.data.path || ''}
                                onChange={(e) => onUpdateNode(selectedNode.id, { path: e.target.value })}
                                className="n8n-input"
                                placeholder="/my-webhook"
                            />
                        </div>
                    </>
                )}

                {selectedNode.type.includes('schedule') && (
                    <>
                        <div>
                            <label className="block text-xs font-medium text-n8n-text-muted mb-1.5 uppercase tracking-wide">
                                Cron Expression
                            </label>
                            <input
                                type="text"
                                value={selectedNode.data.cron || ''}
                                onChange={(e) => onUpdateNode(selectedNode.id, { cron: e.target.value })}
                                className="n8n-input font-mono"
                                placeholder="0 * * * *"
                            />
                            <p className="mt-1 text-xs text-n8n-text-dim">
                                Example: 0 * * * * (every hour)
                            </p>
                        </div>
                    </>
                )}

                {/* Execution result */}
                {nodeResult && (
                    <div className="mt-4 pt-4 border-t border-n8n-border">
                        <label className="block text-xs font-medium text-n8n-text-muted mb-2 uppercase tracking-wide">
                            Last Execution
                        </label>
                        <div className={`p-3 rounded-lg ${nodeResult.status === 'success' ? 'bg-n8n-success/10' : 'bg-n8n-error/10'
                            }`}>
                            <div className="flex items-center gap-2 mb-2">
                                <span className={`w-2 h-2 rounded-full ${nodeResult.status === 'success' ? 'bg-n8n-success' : 'bg-n8n-error'
                                    }`} />
                                <span className={`text-sm font-medium ${nodeResult.status === 'success' ? 'text-n8n-success' : 'text-n8n-error'
                                    }`}>
                                    {nodeResult.status.charAt(0).toUpperCase() + nodeResult.status.slice(1)}
                                </span>
                            </div>
                            {nodeResult.error && (
                                <p className="text-xs text-n8n-error">{nodeResult.error}</p>
                            )}
                            {nodeResult.data && (
                                <pre className="text-xs text-n8n-text-muted bg-n8n-bg-darker p-2 rounded mt-2 overflow-x-auto max-h-32">
                                    {JSON.stringify(nodeResult.data, null, 2)}
                                </pre>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-n8n-border">
                <button className="w-full n8n-btn-secondary justify-center text-n8n-error hover:bg-n8n-error/10 hover:border-n8n-error">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete Node
                </button>
            </div>
        </div>
    );
}
