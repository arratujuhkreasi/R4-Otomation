'use client';

import { memo } from 'react';
import { NodeProps } from 'reactflow';
import BaseNode, { BaseNodeData } from './BaseNode';

interface TriggerNodeData extends BaseNodeData {
    path?: string;
    triggerType?: 'webhook' | 'manual' | 'schedule';
}

const TriggerIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
);

function TriggerNodeComponent(props: NodeProps<TriggerNodeData>) {
    const { data } = props;

    return (
        <BaseNode
            {...props}
            color="bg-n8n-node-trigger"
            icon={<TriggerIcon />}
            subtitle={data.triggerType || 'webhook'}
            hasInputHandle={false}
            hasOutputHandle={true}
        >
            {data.path && (
                <div className="flex items-center gap-1">
                    <span className="text-n8n-text-dim">Path:</span>
                    <span className="text-n8n-text font-mono">{data.path}</span>
                </div>
            )}
        </BaseNode>
    );
}

export const TriggerNode = memo(TriggerNodeComponent);
export default TriggerNode;
