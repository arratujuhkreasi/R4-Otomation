/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: 'class',
    content: [
        './src/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                // n8n signature colors
                n8n: {
                    // Primary orange accent
                    primary: '#ff6d5a',
                    'primary-hover': '#ff5142',
                    'primary-light': '#ff8a7a',

                    // Background colors (dark theme)
                    'bg-dark': '#1a1a1a',
                    'bg-darker': '#0d0d0d',
                    'bg-card': '#262626',
                    'bg-card-hover': '#2d2d2d',
                    'bg-input': '#1f1f1f',
                    'bg-sidebar': '#181818',

                    // Border colors
                    'border': '#3d3d3d',
                    'border-light': '#4a4a4a',
                    'border-focus': '#ff6d5a',

                    // Text colors
                    'text': '#ffffff',
                    'text-muted': '#a3a3a3',
                    'text-dim': '#737373',

                    // Node category colors
                    'node-trigger': '#9b59b6',
                    'node-action': '#3498db',
                    'node-logic': '#e67e22',
                    'node-transform': '#2ecc71',
                    'node-data': '#1abc9c',

                    // Status colors
                    'success': '#10b981',
                    'error': '#ef4444',
                    'warning': '#f59e0b',
                    'running': '#3b82f6',
                },
            },
            boxShadow: {
                'n8n': '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
                'n8n-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3)',
                'n8n-node': '0 2px 8px rgba(0, 0, 0, 0.3)',
                'n8n-node-selected': '0 0 0 2px #ff6d5a, 0 4px 12px rgba(255, 109, 90, 0.3)',
            },
            animation: {
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'spin-slow': 'spin 2s linear infinite',
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
        },
    },
    plugins: [],
};
