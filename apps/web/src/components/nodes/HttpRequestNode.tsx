'use client';

import { memo } from 'react';
import { NodeProps } from 'reactflow';
import BaseNode, { BaseNodeData } from './BaseNode';

interface HttpRequestNodeData extends BaseNodeData {
    url?: string;
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
}

const HttpIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
    </svg>
);

const methodColors: Record<string, string> = {
    GET: 'bg-green-500',
    POST: 'bg-yellow-500',
    PUT: 'bg-blue-500',
    PATCH: 'bg-orange-500',
    DELETE: 'bg-red-500',
};

function HttpRequestNodeComponent(props: NodeProps<HttpRequestNodeData>) {
    const { data } = props;
    const method = data.method || 'GET';

    return (
        <BaseNode
            {...props}
            color="bg-n8n-node-action"
            icon={<HttpIcon />}
            subtitle="HTTP Request"
        >
            <div className="space-y-1">
                <div className="flex items-center gap-2">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold text-white ${methodColors[method]}`}>
                        {method}
                    </span>
                </div>
                {data.url && (
                    <div className="text-n8n-text truncate max-w-[140px] font-mono text-[10px]">
                        {data.url}
                    </div>
                )}
            </div>
        </BaseNode>
    );
}

export const HttpRequestNode = memo(HttpRequestNodeComponent);
export default HttpRequestNode;
