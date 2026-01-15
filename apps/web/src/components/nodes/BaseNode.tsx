'use client';

import { memo, ReactNode } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

export interface BaseNodeData {
    label: string;
    [key: string]: any;
}

interface BaseNodeProps extends NodeProps<BaseNodeData> {
    color: string;
    icon: ReactNode;
    subtitle?: string;
    hasInputHandle?: boolean;
    hasOutputHandle?: boolean;
    outputHandles?: number;
    children?: ReactNode;
    status?: 'idle' | 'running' | 'success' | 'error';
}

function BaseNodeComponent({
    data,
    selected,
    color,
    icon,
    subtitle,
    hasInputHandle = true,
    hasOutputHandle = true,
    outputHandles = 1,
    children,
    status = 'idle',
}: BaseNodeProps) {
    const getStatusColor = () => {
        switch (status) {
            case 'running':
                return 'border-n8n-running';
            case 'success':
                return 'border-n8n-success';
            case 'error':
                return 'border-n8n-error';
            default:
                return selected ? 'border-n8n-primary' : 'border-n8n-border';
        }
    };

    const getStatusIndicator = () => {
        if (status === 'idle') return null;

        return (
            <div className="absolute -top-1 -right-1 z-10">
                {status === 'running' && (
                    <div className="w-4 h-4 rounded-full bg-n8n-running flex items-center justify-center">
                        <svg className="animate-spin w-3 h-3 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                    </div>
                )}
                {status === 'success' && (
                    <div className="w-4 h-4 rounded-full bg-n8n-success flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                )}
                {status === 'error' && (
                    <div className="w-4 h-4 rounded-full bg-n8n-error flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div
            className={`
                relative bg-n8n-bg-card rounded-lg border-2 transition-all duration-200 min-w-[180px]
                ${getStatusColor()}
                ${selected ? 'shadow-n8n-node-selected' : 'shadow-n8n-node hover:shadow-n8n'}
            `}
        >
            {/* Status indicator */}
            {getStatusIndicator()}

            {/* Input Handle */}
            {hasInputHandle && (
                <Handle
                    type="target"
                    position={Position.Left}
                    className="!w-3 !h-3 !bg-n8n-text-dim !border-2 !border-n8n-bg-card !-left-1.5"
                />
            )}

            {/* Node Header */}
            <div className={`${color} text-white px-3 py-2 rounded-t-md flex items-center gap-2`}>
                <div className="w-6 h-6 flex items-center justify-center">
                    {icon}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate">{data.label}</div>
                    {subtitle && <div className="text-xs opacity-75 truncate">{subtitle}</div>}
                </div>
            </div>

            {/* Node Body */}
            {children && (
                <div className="px-3 py-2 text-xs text-n8n-text-muted">
                    {children}
                </div>
            )}

            {/* Output Handles */}
            {hasOutputHandle && outputHandles === 1 && (
                <Handle
                    type="source"
                    position={Position.Right}
                    className="!w-3 !h-3 !bg-n8n-success !border-2 !border-n8n-bg-card !-right-1.5"
                />
            )}
            {hasOutputHandle && outputHandles === 2 && (
                <>
                    <Handle
                        type="source"
                        position={Position.Right}
                        id="true"
                        className="!w-3 !h-3 !bg-n8n-success !border-2 !border-n8n-bg-card !-right-1.5"
                        style={{ top: '30%' }}
                    />
                    <Handle
                        type="source"
                        position={Position.Right}
                        id="false"
                        className="!w-3 !h-3 !bg-n8n-error !border-2 !border-n8n-bg-card !-right-1.5"
                        style={{ top: '70%' }}
                    />
                </>
            )}
        </div>
    );
}

export const BaseNode = memo(BaseNodeComponent);
export default BaseNode;
