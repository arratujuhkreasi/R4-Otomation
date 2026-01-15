'use client';

import { memo } from 'react';
import { NodeProps } from 'reactflow';
import BaseNode, { BaseNodeData } from './BaseNode';

// Tokopedia Node
interface TokopediaNodeData extends BaseNodeData {
    operation?: string;
}

const TokopediaIcon = () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
    </svg>
);

function TokopediaNodeComponent(props: NodeProps<TokopediaNodeData>) {
    const { data } = props;
    return (
        <BaseNode {...props} color="bg-green-600" icon={<TokopediaIcon />} subtitle={data.operation || 'Tokopedia'}>
            {data.operation && <div className="text-n8n-text text-[10px]">{data.operation}</div>}
        </BaseNode>
    );
}
export const TokopediaNode = memo(TokopediaNodeComponent);

// Shopee Node
const ShopeeIcon = () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
    </svg>
);

function ShopeeNodeComponent(props: NodeProps<BaseNodeData>) {
    const { data } = props;
    return (
        <BaseNode {...props} color="bg-orange-600" icon={<ShopeeIcon />} subtitle="Marketplace">
            {data.label && <div className="text-n8n-text text-[10px]">{data.label}</div>}
        </BaseNode>
    );
}
export const ShopeeNode = memo(ShopeeNodeComponent);

// Instagram Node
const InstagramIcon = () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073z" />
    </svg>
);

function InstagramNodeComponent(props: NodeProps<BaseNodeData>) {
    const { data } = props;
    return (
        <BaseNode {...props} color="bg-pink-600" icon={<InstagramIcon />} subtitle="Social Media">
            {data.label && <div className="text-n8n-text text-[10px]">{data.label}</div>}
        </BaseNode>
    );
}
export const InstagramNode = memo(InstagramNodeComponent);

// TikTok Node
const TikTokIcon = () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
    </svg>
);

function TikTokNodeComponent(props: NodeProps<BaseNodeData>) {
    const { data } = props;
    return (
        <BaseNode {...props} color="bg-black" icon={<TikTokIcon />} subtitle="Social Media">
            {data.label && <div className="text-n8n-text text-[10px]">{data.label}</div>}
        </BaseNode>
    );
}
export const TikTokNode = memo(TikTokNodeComponent);

// WhatsApp Node
const WhatsAppIcon = () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
    </svg>
);

function WhatsAppNodeComponent(props: NodeProps<BaseNodeData>) {
    const { data } = props;
    return (
        <BaseNode {...props} color="bg-green-500" icon={<WhatsAppIcon />} subtitle="Messaging">
            {data.label && <div className="text-n8n-text text-[10px]">{data.label}</div>}
        </BaseNode>
    );
}
export const WhatsAppNode = memo(WhatsAppNodeComponent);

// Telegram Node
const TelegramIcon = () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
);

function TelegramNodeComponent(props: NodeProps<BaseNodeData>) {
    const { data } = props;
    return (
        <BaseNode {...props} color="bg-blue-500" icon={<TelegramIcon />} subtitle="Messaging">
            {data.label && <div className="text-n8n-text text-[10px]">{data.label}</div>}
        </BaseNode>
    );
}
export const TelegramNode = memo(TelegramNodeComponent);

// Google Sheets Node
const GoogleSheetsIcon = () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-8 14H7v-2h4v2zm0-4H7v-2h4v2zm0-4H7V7h4v2zm6 8h-4v-2h4v2zm0-4h-4v-2h4v2zm0-4h-4V7h4v2z" />
    </svg>
);

function GoogleSheetsNodeComponent(props: NodeProps<BaseNodeData>) {
    const { data } = props;
    return (
        <BaseNode {...props} color="bg-green-600" icon={<GoogleSheetsIcon />} subtitle="Data">
            {data.label && <div className="text-n8n-text text-[10px]">{data.label}</div>}
        </BaseNode>
    );
}
export const GoogleSheetsNode = memo(GoogleSheetsNodeComponent);
