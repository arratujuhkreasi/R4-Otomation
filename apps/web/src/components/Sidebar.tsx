'use client';

import { useState, useMemo } from 'react';

interface NodeItem {
    type: string;
    label: string;
    icon: React.ReactNode;
}

interface NodeCategory {
    name: string;
    color: string;
    icon: React.ReactNode;
    nodes: NodeItem[];
}

interface SidebarProps {
    onAddNode: (type: string, label: string) => void;
}

// Icons
const TriggerIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
);

const ActionIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
    </svg>
);

const LogicIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
    </svg>
);

const TransformIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
);

const ShopIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
);

const SocialIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
);

const DataIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
    </svg>
);

const MessageIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
);

const nodeCategories: NodeCategory[] = [
    {
        name: 'Triggers',
        color: 'bg-purple-500',
        icon: <TriggerIcon />,
        nodes: [
            { type: 'triggerNode', label: 'Webhook', icon: <TriggerIcon /> },
            { type: 'scheduleNode', label: 'Schedule', icon: <TriggerIcon /> },
            { type: 'manualTrigger', label: 'Manual Trigger', icon: <TriggerIcon /> },
        ],
    },
    {
        name: 'Marketplace Indonesia',
        color: 'bg-green-500',
        icon: <ShopIcon />,
        nodes: [
            { type: 'tokopediaNode', label: 'Tokopedia', icon: <ShopIcon /> },
            { type: 'shopeeNode', label: 'Shopee', icon: <ShopIcon /> },
            { type: 'bukalapakNode', label: 'Bukalapak', icon: <ShopIcon /> },
            { type: 'lazadaNode', label: 'Lazada', icon: <ShopIcon /> },
        ],
    },
    {
        name: 'Social Media',
        color: 'bg-pink-500',
        icon: <SocialIcon />,
        nodes: [
            { type: 'instagramNode', label: 'Instagram', icon: <SocialIcon /> },
            { type: 'tiktokNode', label: 'TikTok', icon: <SocialIcon /> },
            { type: 'facebookNode', label: 'Facebook', icon: <SocialIcon /> },
            { type: 'twitterNode', label: 'Twitter / X', icon: <SocialIcon /> },
        ],
    },
    {
        name: 'Messaging',
        color: 'bg-teal-500',
        icon: <MessageIcon />,
        nodes: [
            { type: 'whatsappNode', label: 'WhatsApp', icon: <MessageIcon /> },
            { type: 'telegramNode', label: 'Telegram', icon: <MessageIcon /> },
            { type: 'emailNode', label: 'Email (SMTP)', icon: <MessageIcon /> },
        ],
    },
    {
        name: 'Actions',
        color: 'bg-blue-500',
        icon: <ActionIcon />,
        nodes: [
            { type: 'httpRequestNode', label: 'HTTP Request', icon: <ActionIcon /> },
            { type: 'webhookResponse', label: 'Respond Webhook', icon: <ActionIcon /> },
        ],
    },
    {
        name: 'Logic',
        color: 'bg-orange-500',
        icon: <LogicIcon />,
        nodes: [
            { type: 'ifNode', label: 'IF', icon: <LogicIcon /> },
            { type: 'switchNode', label: 'Switch', icon: <LogicIcon /> },
            { type: 'mergeNode', label: 'Merge', icon: <LogicIcon /> },
            { type: 'loopNode', label: 'Loop', icon: <LogicIcon /> },
        ],
    },
    {
        name: 'Data & Transform',
        color: 'bg-cyan-500',
        icon: <TransformIcon />,
        nodes: [
            { type: 'setNode', label: 'Set', icon: <TransformIcon /> },
            { type: 'codeNode', label: 'Code', icon: <TransformIcon /> },
            { type: 'splitNode', label: 'Split Items', icon: <TransformIcon /> },
            { type: 'aggregateNode', label: 'Aggregate', icon: <TransformIcon /> },
        ],
    },
    {
        name: 'Data Storage',
        color: 'bg-indigo-500',
        icon: <DataIcon />,
        nodes: [
            { type: 'googleSheetsNode', label: 'Google Sheets', icon: <DataIcon /> },
            { type: 'mysqlNode', label: 'MySQL', icon: <DataIcon /> },
            { type: 'postgresNode', label: 'PostgreSQL', icon: <DataIcon /> },
            { type: 'mongodbNode', label: 'MongoDB', icon: <DataIcon /> },
        ],
    },
];

export default function Sidebar({ onAddNode }: SidebarProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedCategories, setExpandedCategories] = useState<string[]>([
        'Triggers',
        'Marketplace Indonesia',
        'Social Media',
    ]);

    const filteredCategories = useMemo(() => {
        if (!searchQuery.trim()) return nodeCategories;

        const query = searchQuery.toLowerCase();
        return nodeCategories
            .map((category) => ({
                ...category,
                nodes: category.nodes.filter((node) =>
                    node.label.toLowerCase().includes(query)
                ),
            }))
            .filter((category) => category.nodes.length > 0);
    }, [searchQuery]);

    const toggleCategory = (categoryName: string) => {
        setExpandedCategories((prev) =>
            prev.includes(categoryName)
                ? prev.filter((c) => c !== categoryName)
                : [...prev, categoryName]
        );
    };

    const handleDragStart = (e: React.DragEvent, type: string, label: string) => {
        e.dataTransfer.setData('application/reactflow', JSON.stringify({ type, label }));
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleNodeClick = (type: string, label: string) => {
        onAddNode(type, label);
    };

    return (
        <aside className="w-64 h-full bg-n8n-bg-darker border-r border-n8n-border flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-n8n-border">
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-n8n-primary to-orange-600 flex items-center justify-center">
                        <span className="text-white font-bold text-sm">FA</span>
                    </div>
                    <div>
                        <h1 className="font-semibold text-n8n-text text-sm">FlowAutomator</h1>
                        <p className="text-[10px] text-n8n-text-muted">n8n Clone</p>
                    </div>
                </div>

                {/* Search */}
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search nodes..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-3 py-2 pl-9 text-sm rounded-lg bg-n8n-bg-dark border border-n8n-border text-n8n-text placeholder:text-n8n-text-dim focus:outline-none focus:border-n8n-primary/50 focus:ring-1 focus:ring-n8n-primary/20 transition-all"
                    />
                    <svg
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-n8n-text-dim"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
            </div>

            {/* Node Categories */}
            <div className="flex-1 overflow-y-auto p-2">
                {filteredCategories.map((category) => (
                    <div key={category.name} className="mb-2">
                        {/* Category Header */}
                        <button
                            onClick={() => toggleCategory(category.name)}
                            className="w-full flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-n8n-bg-dark transition-colors group"
                        >
                            <div className={`w-5 h-5 rounded flex items-center justify-center ${category.color} text-white`}>
                                {category.icon}
                            </div>
                            <span className="flex-1 text-left text-sm font-medium text-n8n-text">
                                {category.name}
                            </span>
                            <span className="text-[10px] text-n8n-text-dim bg-n8n-bg-dark px-1.5 py-0.5 rounded">
                                {category.nodes.length}
                            </span>
                            <svg
                                className={`w-4 h-4 text-n8n-text-dim transition-transform ${expandedCategories.includes(category.name) ? 'rotate-90' : ''
                                    }`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>

                        {/* Category Nodes */}
                        {expandedCategories.includes(category.name) && (
                            <div className="ml-4 mt-1 space-y-1">
                                {category.nodes.map((node) => (
                                    <div
                                        key={node.type}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, node.type, node.label)}
                                        onClick={() => handleNodeClick(node.type, node.label)}
                                        className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-grab hover:bg-n8n-bg-dark border border-transparent hover:border-n8n-border transition-all group active:cursor-grabbing"
                                    >
                                        <div className={`w-6 h-6 rounded flex items-center justify-center ${category.color}/20 text-${category.color.replace('bg-', '')}`}>
                                            {node.icon}
                                        </div>
                                        <span className="text-sm text-n8n-text group-hover:text-white transition-colors">
                                            {node.label}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-n8n-border">
                <p className="text-[10px] text-n8n-text-dim text-center">
                    Drag nodes to canvas or click to add
                </p>
            </div>
        </aside>
    );
}
