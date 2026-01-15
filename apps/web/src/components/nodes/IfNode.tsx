'use client';

import { memo } from 'react';
import { NodeProps } from 'reactflow';
import BaseNode, { BaseNodeData } from './BaseNode';

interface IfNodeData extends BaseNodeData {
    condition?: string;
}

const IfIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

function IfNodeComponent(props: NodeProps<IfNodeData>) {
    const { data } = props;

    return (
        <BaseNode
            {...props}
            color="bg-n8n-node-logic"
            icon={<IfIcon />}
            subtitle="Condition"
            outputHandles={2}
        >
            <div className="space-y-1">
                {data.condition ? (
                    <div className="text-n8n-text truncate max-w-[140px] font-mono text-[10px]">
                        {data.condition}
                    </div>
                ) : (
                    <div className="text-n8n-text-dim italic text-[10px]">No condition set</div>
                )}
                <div className="flex justify-between text-[10px] mt-1">
                    <span className="text-n8n-success">✓ true</span>
                    <span className="text-n8n-error">✗ false</span>
                </div>
            </div>
        </BaseNode>
    );
}

export const IfNode = memo(IfNodeComponent);
export default IfNode;
