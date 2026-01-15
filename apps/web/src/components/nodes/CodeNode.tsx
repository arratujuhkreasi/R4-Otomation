'use client';

import { memo } from 'react';
import { NodeProps } from 'reactflow';
import BaseNode, { BaseNodeData } from './BaseNode';

interface CodeNodeData extends BaseNodeData {
    code?: string;
    language?: 'javascript' | 'python';
}

const CodeIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
);

function CodeNodeComponent(props: NodeProps<CodeNodeData>) {
    const { data } = props;
    const codePreview = data.code?.split('\n')[0]?.substring(0, 25) || 'No code';

    return (
        <BaseNode
            {...props}
            color="bg-n8n-node-transform"
            icon={<CodeIcon />}
            subtitle={data.language || 'JavaScript'}
        >
            <div className="bg-n8n-bg-darker rounded p-1.5 font-mono text-[10px] text-n8n-text-muted truncate">
                {codePreview}{codePreview.length >= 25 ? '...' : ''}
            </div>
        </BaseNode>
    );
}

export const CodeNode = memo(CodeNodeComponent);
export default CodeNode;
