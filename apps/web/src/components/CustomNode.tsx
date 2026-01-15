import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

// --- Constants & Helper Config ---

// Konfigurasi warna dan icon berdasarkan tipe layanan
const SERVICE_STYLES: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
    // Marketplace Indonesia
    'tokopedia': {
        color: '#42b549',
        label: 'Tokopedia',
        icon: (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12c0 5.52 4.48 10 10 10s10-4.48 10-10c0-5.52-4.48-10-10-10zm-1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
            </svg>
        )
    },
    'shopee': {
        color: '#ee4d2d',
        label: 'Shopee',
        icon: (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16 6V4a4 4 0 0 0-8 0v2H5v14h14V6h-3zm-6-2a2 2 0 0 1 4 0v2h-4V4z" />
            </svg>
        )
    },
    'bukalapak': {
        color: '#e31e52',
        label: 'Bukalapak',
        icon: (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 9h-2V7h2v5z" />
            </svg>
        )
    },
    // Social & Messaging
    'whatsapp': {
        color: '#25D366',
        label: 'WhatsApp',
        icon: (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2Z" />
            </svg>
        )
    },
    // Logic & Core
    'logic-filter': {
        color: '#6366f1', // Indigo
        label: 'Filter',
        icon: (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
        )
    },
    'default': {
        color: '#64748b', // Slate
        label: 'Node',
        icon: (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            </svg>
        )
    }
};

const CustomNode = ({ data, type, selected }: NodeProps) => {
    // Determine style based on node type or data.service
    // Prioritize specific variant names in 'type' (e.g., 'trigger-shopee') or data.service

    let styleKey = 'default';

    // Check type string (e.g. 'trigger-shopee' -> 'shopee')
    Object.keys(SERVICE_STYLES).forEach(key => {
        if (type?.includes(key) || data.label?.toLowerCase().includes(key)) {
            styleKey = key;
        }
    });

    const style = SERVICE_STYLES[styleKey] || SERVICE_STYLES['default'];
    const isActive = data.active !== false; // Default true if not specified

    return (
        <div
            className={`
                group relative min-w-[240px] rounded-lg bg-white shadow-sm transition-all duration-200
                ${selected ? 'ring-2 ring-offset-2 ring-indigo-500 shadow-xl' : 'border border-gray-200 hover:shadow-md'}
            `}
        >
            {/* --- Header --- */}
            <div
                className="flex items-center gap-3 px-4 py-3 rounded-t-lg transition-colors"
                style={{ backgroundColor: style.color }}
            >
                <div className="text-white drop-shadow-md">
                    {style.icon}
                </div>
                <div className="flex-1">
                    <h3 className="text-sm font-bold text-white tracking-wide">
                        {style.label}
                    </h3>
                </div>
                {/* Optional: Options dot */}
                <div className="text-white/80 hover:text-white cursor-pointer">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                    </svg>
                </div>
            </div>

            {/* --- Body --- */}
            <div className="p-4 bg-white rounded-b-lg">
                <div className="mb-2">
                    <p className="text-sm font-medium text-gray-900 line-clamp-1">
                        {data.label || style.label}
                    </p>
                    <p className="text-xs text-gray-500 line-clamp-2 mt-1">
                        {data.description || 'No description provided'}
                    </p>
                </div>

                {/* Status Indicator */}
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                    <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {isActive ? 'Active' : 'Inactive'}
                    </span>

                    {/* Execution Status Tag (If running) */}
                    {data.status && data.status !== 'idle' && (
                        <span className={`ml-auto text-[10px] px-2 py-0.5 rounded-full font-bold uppercase
                            ${data.status === 'success' ? 'bg-green-100 text-green-700' :
                                data.status === 'error' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}
                         `}>
                            {data.status}
                        </span>
                    )}
                </div>
            </div>

            {/* --- Handles --- */}

            {/* Input Handle (Target) */}
            {type !== 'trigger' && !type?.includes('trigger') && (
                <Handle
                    type="target"
                    position={Position.Left}
                    className="!w-3 !h-3 !-left-1.5 !bg-gray-400 !border-2 !border-white group-hover:!bg-indigo-500 transition-colors"
                />
            )}

            {/* Output Handle (Source) */}
            <Handle
                type="source"
                position={Position.Right}
                className="!w-3 !h-3 !-right-1.5 !bg-gray-400 !border-2 !border-white group-hover:!bg-indigo-500 transition-colors"
            />
        </div>
    );
};

export default memo(CustomNode);
