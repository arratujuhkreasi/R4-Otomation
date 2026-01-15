/**
 * GET /api/nodes
 * List all available nodes
 */

import { NextResponse } from 'next/server';

const nodes = [
    // Marketplace Indonesia
    {
        name: 'tokopedia',
        displayName: 'Tokopedia',
        category: 'marketplace',
        icon: { type: 'fa', value: 'fa-store', color: '#42B549' },
        description: 'Manage orders and products on Tokopedia',
    },
    {
        name: 'shopee',
        displayName: 'Shopee',
        category: 'marketplace',
        icon: { type: 'fa', value: 'fa-shopping-cart', color: '#EE4D2D' },
        description: 'Manage orders and products on Shopee',
    },
    {
        name: 'bukalapak',
        displayName: 'Bukalapak',
        category: 'marketplace',
        icon: { type: 'fa', value: 'fa-shopping-bag', color: '#E31E52' },
        description: 'Manage transactions on Bukalapak',
    },
    {
        name: 'lazada',
        displayName: 'Lazada',
        category: 'marketplace',
        icon: { type: 'fa', value: 'fa-shopping-cart', color: '#0F146D' },
        description: 'Manage orders on Lazada',
    },
    // Social Media
    {
        name: 'instagram',
        displayName: 'Instagram',
        category: 'social',
        icon: { type: 'fa', value: 'fa-instagram', color: '#E4405F' },
        description: 'Post content and manage Instagram',
    },
    {
        name: 'tiktok',
        displayName: 'TikTok',
        category: 'social',
        icon: { type: 'fa', value: 'fa-music', color: '#000000' },
        description: 'Upload videos to TikTok',
    },
    {
        name: 'facebook',
        displayName: 'Facebook',
        category: 'social',
        icon: { type: 'fa', value: 'fa-facebook', color: '#1877F2' },
        description: 'Manage Facebook Pages',
    },
    {
        name: 'twitter',
        displayName: 'Twitter / X',
        category: 'social',
        icon: { type: 'fa', value: 'fa-twitter', color: '#1DA1F2' },
        description: 'Post tweets and manage X',
    },
    // Messaging
    {
        name: 'whatsapp',
        displayName: 'WhatsApp',
        category: 'messaging',
        icon: { type: 'fa', value: 'fa-whatsapp', color: '#25D366' },
        description: 'Send messages via WhatsApp Business',
    },
    {
        name: 'telegram',
        displayName: 'Telegram',
        category: 'messaging',
        icon: { type: 'fa', value: 'fa-telegram', color: '#0088CC' },
        description: 'Send messages via Telegram Bot',
    },
    {
        name: 'email',
        displayName: 'Email',
        category: 'messaging',
        icon: { type: 'fa', value: 'fa-envelope', color: '#EA4335' },
        description: 'Send emails via SMTP',
    },
    // Data
    {
        name: 'googlesheets',
        displayName: 'Google Sheets',
        category: 'data',
        icon: { type: 'fa', value: 'fa-table', color: '#34A853' },
        description: 'Read and write to Google Sheets',
    },
    {
        name: 'http-request',
        displayName: 'HTTP Request',
        category: 'core',
        icon: { type: 'fa', value: 'fa-globe', color: '#6366F1' },
        description: 'Make HTTP requests to any API',
    },
];

export async function GET() {
    return NextResponse.json(nodes);
}
