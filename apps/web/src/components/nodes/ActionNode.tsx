'use client';

import { memo } from 'react';
import { NodeProps } from 'reactflow';
import BaseNode, { BaseNodeData } from './BaseNode';

interface ActionNodeData extends BaseNodeData {
    url?: string;
    method?: string;
}

const ActionIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
    </svg>
);

function ActionNodeComponent(props: NodeProps<ActionNodeData>) {
    const { data } = props;

    return (
        <BaseNode
            {...props}
            color="bg-n8n-node-action"
            icon={<ActionIcon />}
            subtitle="Action"
        >
            {data.url && (
                <div className="text-n8n-text truncate max-w-[140px] font-mono text-[10px]">
                    {data.url}
                </div>
            )}
        </BaseNode>
    );
}

export const ActionNode = memo(ActionNodeComponent);
export default ActionNode;
