import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'n8n - Workflow Automation',
    description: 'A scalable, self-hosted workflow automation tool',
    icons: {
        icon: '/favicon.ico',
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className="dark">
            <body className={`${inter.className} bg-n8n-bg-dark text-n8n-text`}>
                {children}
            </body>
        </html>
    );
}
