import React from 'react';

// --- Static Icons ---
const ShopeeIcon = () => (
    <svg className="w-8 h-8 text-[#ee4d2d]" viewBox="0 0 24 24" fill="currentColor">
        <path d="M16 6V4a4 4 0 0 0-8 0v2H5v14h14V6h-3zm-6-2a2 2 0 0 1 4 0v2h-4V4z" />
    </svg>
);

const WhastAppIcon = () => (
    <svg className="w-8 h-8 text-[#25D366]" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2Z" />
    </svg>
);

const ExcelIcon = () => (
    <svg className="w-8 h-8 text-[#1D6F42]" viewBox="0 0 24 24" fill="currentColor">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zM6 20V4h7v5h5v11H6z" />
        <path d="M10 10h4v2h-4zm0 3h4v2h-4zm0 3h4v2h-4z" />
    </svg>
);

// --- Mock Data ---
interface Template {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    color: string; // Background accent color
    difficulty: 'Easy' | 'Medium' | 'Hard';
    connectors: string[]; // List of logos to show small
}

const TEMPLATES: Template[] = [
    {
        id: 'tpl_reply_shopee',
        title: 'Auto-Reply Chat Shopee',
        description: 'Balas otomatis chat pelanggan di luar jam kerja dengan pesan personalisasi.',
        icon: <ShopeeIcon />,
        color: 'bg-orange-50',
        difficulty: 'Easy',
        connectors: ['shopee', 'openai']
    },
    {
        id: 'tpl_payment_wa',
        title: 'Follow-up Pembayaran WA',
        description: 'Kirim pengingat WhatsApp otomatis jika invoice Tokopedia belum dibayar setelah 1 jam.',
        icon: <WhastAppIcon />,
        color: 'bg-green-50',
        difficulty: 'Medium',
        connectors: ['tokopedia', 'whatsapp']
    },
    {
        id: 'tpl_backup_excel',
        title: 'Simpan Order ke Excel',
        description: 'Backup data penjualan harian dari semua marketplace ke Google Sheets atau Excel.',
        icon: <ExcelIcon />,
        color: 'bg-emerald-50',
        difficulty: 'Easy',
        connectors: ['shopee', 'tokopedia', 'sheets']
    }
];

interface TemplateGalleryProps {
    onSelectTemplate: (templateId: string) => void;
}

export default function TemplateGallery({ onSelectTemplate }: TemplateGalleryProps) {
    return (
        <div className="min-h-screen bg-gray-50 p-8 font-sans">
            {/* Header Section */}
            <div className="max-w-7xl mx-auto mb-12 text-center">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
                    Mulai Otomatisasi Toko Anda 🚀
                </h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                    Pilih resep siap pakai untuk meningkatkan penjualan dan efisiensi operasional toko Anda.
                </p>
            </div>

            {/* Grid Layout */}
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {TEMPLATES.map((template) => (
                    <div
                        key={template.id}
                        className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col overflow-hidden"
                    >
                        {/* Upper Card - Color Accent */}
                        <div className={`h-2 ${template.color.replace('50', '500')}`} />

                        <div className="p-8 flex-1 flex flex-col">
                            {/* Icon & Difficulty Header */}
                            <div className="flex justify-between items-start mb-6">
                                <div className={`p-4 rounded-2xl ${template.color}`}>
                                    {template.icon}
                                </div>
                                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-600 uppercase tracking-wide">
                                    {template.difficulty}
                                </span>
                            </div>

                            {/* Content */}
                            <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors">
                                {template.title}
                            </h3>
                            <p className="text-gray-500 mb-8 leading-relaxed flex-1">
                                {template.description}
                            </p>

                            {/* Action Area */}
                            <div className="mt-auto">
                                <button
                                    onClick={() => onSelectTemplate(template.id)}
                                    className="w-full py-3 px-6 bg-gray-900 hover:bg-indigo-600 text-white font-semibold rounded-xl transition-colors duration-200 flex items-center justify-center gap-2 shadow-lg shadow-gray-200 hover:shadow-indigo-200"
                                >
                                    <span>Gunakan Template</span>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Bottom Call to Action */}
            <div className="max-w-2xl mx-auto mt-16 text-center">
                <p className="text-gray-500 mb-4">Ingin membuat workflow dari nol?</p>
                <button
                    onClick={() => onSelectTemplate('blank')}
                    className="text-indigo-600 hover:text-indigo-800 font-medium underline underline-offset-4 decoration-2"
                >
                    Buat Workflow Kosong &rarr;
                </button>
            </div>
        </div>
    );
}
