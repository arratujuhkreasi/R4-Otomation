
import React, { useState } from 'react';
import {
    ShoppingBag,
    Truck,
    Share2,
    Wrench,
    ChevronDown,
    ChevronRight,
    Search,
    GripVertical
} from 'lucide-react';

interface SidebarItem {
    type: string;
    label: string;
    icon?: string; // Optional custom logic for icons
}

interface Category {
    id: string;
    label: string;
    icon: React.ReactNode;
    items: SidebarItem[];
}

const CATEGORIES: Category[] = [
    {
        id: 'marketplace',
        label: 'Marketplace',
        icon: <ShoppingBag size={18} />,
        items: [
            { type: 'tokopediaNode', label: 'Tokopedia' },
            { type: 'shopeeNode', label: 'Shopee' },
            { type: 'tiktokNode', label: 'TikTok Shop' },
            { type: 'lazadaNode', label: 'Lazada' },
        ]
    },
    {
        id: 'social',
        label: 'Social Media',
        icon: <Share2 size={18} />,
        items: [
            { type: 'whatsappNode', label: 'WhatsApp' },
            { type: 'telegramNode', label: 'Telegram' },
            { type: 'instagramNode', label: 'Instagram' },
            { type: 'facebookNode', label: 'Facebook' },
            { type: 'emailNode', label: 'Email' },
        ]
    },
    {
        id: 'logistics',
        label: 'Logistik',
        icon: <Truck size={18} />,
        items: [
            { type: 'httpRequestNode', label: 'Cek Resi' },
            { type: 'httpRequestNode', label: 'Cek Ongkir' },
            { type: 'httpRequestNode', label: 'Request Pickup' },
        ]
    },
    {
        id: 'tools',
        label: 'Tools & Logic',
        icon: <Wrench size={18} />,
        items: [
            { type: 'ifNode', label: 'IF Condition' },
            { type: 'codeNode', label: 'Code (JS)' },
            { type: 'httpRequestNode', label: 'HTTP Request' },
            { type: 'scheduleNode', label: 'Schedule / Cron' },
            { type: 'googleSheetsNode', label: 'Google Sheets' },
        ]
    }
];

interface SidebarMenuProps {
    onAddNode: (type: string, label: string) => void;
}

export default function SidebarMenu({ onAddNode }: SidebarMenuProps) {
    const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
        marketplace: true,
        social: true,
        tools: true
    });
    const [searchTerm, setSearchTerm] = useState('');

    const toggleCategory = (id: string) => {
        setExpandedCategories(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    const handleDragStart = (event: React.DragEvent, type: string, label: string) => {
        event.dataTransfer.setData('application/reactflow', JSON.stringify({ type, label }));
        event.dataTransfer.effectAllowed = 'move';
    };

    return (
        <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-full text-slate-300">
            {/* Search */}
            <div className="p-4 border-b border-slate-800">
                <div className="relative">
                    <Search className="absolute left-3 top-2.5 text-slate-500" size={16} />
                    <input
                        type="text"
                        placeholder="Cari component..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-800 text-sm text-white placeholder-slate-500 rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 border border-slate-700"
                    />
                </div>
            </div>

            {/* Menu List */}
            <div className="flex-1 overflow-y-auto py-2 custom-scrollbar">
                {CATEGORIES.map((category) => {
                    // Filter logic
                    const filteredItems = category.items.filter(item =>
                        item.label.toLowerCase().includes(searchTerm.toLowerCase())
                    );

                    if (searchTerm && filteredItems.length === 0) return null;

                    const isExpanded = expandedCategories[category.id] || searchTerm.length > 0;

                    return (
                        <div key={category.id} className="mb-2">
                            {/* Accordion Header */}
                            <button
                                onClick={() => toggleCategory(category.id)}
                                className="w-full flex items-center justify-between px-4 py-2 hover:bg-slate-800 transition-colors group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="text-indigo-400 group-hover:text-indigo-300 transition-colors">
                                        {category.icon}
                                    </div>
                                    <span className="font-semibold text-sm tracking-wide">{category.label}</span>
                                </div>
                                {isExpanded ? (
                                    <ChevronDown size={14} className="text-slate-500" />
                                ) : (
                                    <ChevronRight size={14} className="text-slate-500" />
                                )}
                            </button>

                            {/* Items */}
                            {isExpanded && (
                                <div className="mt-1 px-3 space-y-1">
                                    {(searchTerm ? filteredItems : category.items).map((item, idx) => (
                                        <div
                                            key={`${category.id}-${idx}`}
                                            className="group flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-800 cursor-grab active:cursor-grabbing border border-transparent hover:border-slate-700 transition-all"
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, item.type, item.label)}
                                            onClick={() => onAddNode(item.type, item.label)}
                                        >
                                            <GripVertical size={14} className="text-slate-600 group-hover:text-slate-400" />
                                            <span className="text-sm font-medium text-slate-400 group-hover:text-white">
                                                {item.label}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Footer / Version */}
            <div className="p-4 border-t border-slate-800 text-center">
                <p className="text-xs text-slate-600">
                    R4 Otomation v2.0.1
                </p>
            </div>
        </aside>
    );
}
