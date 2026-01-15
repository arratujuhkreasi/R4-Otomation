import React, { useState, useEffect } from 'react';

// --- Types ---

interface NodeConfigProps {
    isOpen: boolean;
    onClose: () => void;
    selectedNode: {
        id: string;
        type: string;
        data: Record<string, any>;
    } | null;
    onUpdateNode: (nodeId: string, data: Record<string, any>) => void;
}

// --- Specific Forms ---

const ShopeeForm = ({ data, onChange }: { data: any, onChange: (key: string, value: any) => void }) => {
    return (
        <div className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pilih Toko</label>
                <select
                    value={data.parameters?.shopId || ''}
                    onChange={(e) => onChange('parameters.shopId', e.target.value)}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2 border"
                >
                    <option value="">-- Pilih Toko --</option>
                    <option value="shop_a">Toko Sepatu A (Star Seller)</option>
                    <option value="shop_b">Toko Sepatu B (Official)</option>
                    <option value="shop_c">Toko Elektronik C</option>
                </select>
                <p className="mt-1 text-xs text-gray-500">Pilih akun toko yang terhubung</p>
            </div>

            <div className="flex items-center">
                <input
                    id="unpaid-orders"
                    type="checkbox"
                    checked={data.parameters?.onlyUnpaid || false}
                    onChange={(e) => onChange('parameters.onlyUnpaid', e.target.checked)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="unpaid-orders" className="ml-2 block text-sm text-gray-900">
                    Hanya Pesanan Belum Dibayar
                </label>
            </div>

            <div className="flex items-center">
                <input
                    id="include-details"
                    type="checkbox"
                    checked={data.parameters?.includeDetails || false}
                    onChange={(e) => onChange('parameters.includeDetails', e.target.checked)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="include-details" className="ml-2 block text-sm text-gray-900">
                    Sertakan Detail Produk
                </label>
            </div>
        </div>
    );
};

const WhatsAppForm = ({ data, onChange }: { data: any, onChange: (key: string, value: any) => void }) => {
    return (
        <div className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nomor Tujuan</label>
                <div className="relative rounded-md shadow-sm">
                    <input
                        type="text"
                        value={data.parameters?.phoneNumber || ''}
                        onChange={(e) => onChange('parameters.phoneNumber', e.target.value)}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm p-2 border pr-10"
                        placeholder="Contoh: 62812345678"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <span className="text-gray-400 text-xs text font-mono">{'{{Variable}}'}</span>
                    </div>
                </div>
                <p className="mt-1 text-xs text-gray-500">Gunakan format internasional (62...)</p>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Isi Pesan</label>
                <textarea
                    rows={4}
                    value={data.parameters?.message || ''}
                    onChange={(e) => onChange('parameters.message', e.target.value)}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm p-2 border"
                    placeholder="Halo, pesanan Anda telah kami terima..."
                />
                <p className="mt-1 text-xs text-gray-500">Anda bisa menggunakan variable dynamic seperti {'{{order_id}}'}</p>
            </div>
        </div>
    );
};

const DefaultForm = ({ data, onChange }: { data: any, onChange: (key: string, value: any) => void }) => (
    <div className="space-y-4">
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Parameter Key</label>
            <input
                type="text"
                className="w-full border border-gray-300 rounded p-2"
                placeholder="key"
            />
        </div>
        <div className="p-4 bg-gray-50 rounded text-sm text-gray-500">
            Konfigurasi spesifik belum tersedia untuk tipe node ini.
        </div>
    </div>
);


// --- Generic Sidebar Component ---

export default function NodeConfigSidebar({ isOpen, onClose, selectedNode, onUpdateNode }: NodeConfigProps) {
    // Local state for immediate feedback
    const [localData, setLocalData] = useState<Record<string, any>>({});

    useEffect(() => {
        if (selectedNode) {
            setLocalData(selectedNode.data || {});
        }
    }, [selectedNode]);

    // Handle deep updates helper
    const handleUpdate = (path: string, value: any) => {
        if (!selectedNode) return;

        // Simple deep set implementation for MVP (supports 'parameters.key')
        const newData = JSON.parse(JSON.stringify(localData));

        if (path.includes('.')) {
            const [parent, child] = path.split('.');
            if (!newData[parent]) newData[parent] = {};
            newData[parent][child] = value;
        } else {
            newData[path] = value;
        }

        setLocalData(newData);
        onUpdateNode(selectedNode.id, newData);
    };

    // Render form based on type
    const renderForm = () => {
        if (!selectedNode) return null;

        const type = selectedNode.type || '';
        const data = selectedNode.data || {};
        const label = data.label || '';

        // Check type OR label content for matching
        if (type.includes('shopee') || label.toLowerCase().includes('shopee')) {
            return <ShopeeForm data={localData} onChange={handleUpdate} />;
        }
        if (type.includes('whatsapp') || label.toLowerCase().includes('whatsapp')) {
            return <WhatsAppForm data={localData} onChange={handleUpdate} />;
        }

        return <DefaultForm data={localData} onChange={handleUpdate} />;
    };

    return (
        <>
            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity"
                    onClick={onClose}
                />
            )}

            {/* Sidebar Panel */}
            <div
                className={`
                    fixed top-0 right-0 h-full w-[400px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out border-l border-gray-200
                    ${isOpen ? 'translate-x-0' : 'translate-x-full'}
                `}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">
                            {selectedNode ? (selectedNode.data?.label || 'Konfigurasi Node') : 'Konfigurasi'}
                        </h2>
                        <p className="text-xs text-gray-500 font-mono mt-0.5">
                            ID: {selectedNode?.id}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto h-[calc(100%-80px)]">
                    {selectedNode ? (
                        <div className="space-y-6">
                            {/* Common Field: Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Nama Node</label>
                                <input
                                    type="text"
                                    value={localData.label || ''}
                                    onChange={(e) => handleUpdate('label', e.target.value)}
                                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2 border"
                                />
                            </div>

                            <hr className="border-gray-100" />

                            {/* Dynamic Specific Form */}
                            {renderForm()}

                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-400">
                            Pilih node untuk mengedit konfigurasi
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
