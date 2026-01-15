'use client';

import { memo } from 'react';
import { NodeProps } from 'reactflow';
import BaseNode, { BaseNodeData } from './BaseNode';

interface SetNodeData extends BaseNodeData {
    fieldName?: string;
    fieldValue?: string;
}

const SetIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
);

function SetNodeComponent(props: NodeProps<SetNodeData>) {
    const { data } = props;

    return (
        <BaseNode
            {...props}
            color="bg-n8n-node-data"
            icon={<SetIcon />}
            subtitle="Set Data"
        >
            {data.fieldName ? (
                <div className="flex items-center gap-1 text-[10px]">
                    <span className="text-n8n-text font-medium">{data.fieldName}</span>
                    <span className="text-n8n-text-dim">=</span>
                    <span className="text-n8n-primary truncate max-w-[80px]">{data.fieldValue || '""'}</span>
                </div>
            ) : (
                <div className="text-n8n-text-dim italic text-[10px]">No fields set</div>
            )}
        </BaseNode>
    );
}

export const SetNode = memo(SetNodeComponent);
export default SetNode;
