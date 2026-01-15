
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
    Wifi,
    WifiOff,
    User,
    Bell,
    Settings,
    LogOut
} from 'lucide-react';

interface NavbarProps {
    isConnected?: boolean;
}

export default function Navbar({ isConnected = true }: NavbarProps) {
    const { user, logout } = useAuth();

    return (
        <nav className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between z-30 relative shadow-sm">
            {/* Logo Section */}
            <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                    R4
                </div>
                <div className="flex flex-col">
                    <span className="font-bold text-gray-900 leading-tight">R4 Otomation</span>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-600">Enterprise</span>
                </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-6">
                {/* Connection Status */}
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border ${isConnected
                        ? 'bg-green-50 text-green-700 border-green-200'
                        : 'bg-red-50 text-red-700 border-red-200'
                    }`}>
                    {isConnected ? (
                        <>
                            <Wifi size={14} />
                            <span>Online</span>
                        </>
                    ) : (
                        <>
                            <WifiOff size={14} />
                            <span>Offline</span>
                        </>
                    )}
                </div>

                <div className="h-6 w-px bg-gray-200" />

                {/* Actions */}
                <div className="flex items-center gap-3">
                    <button className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors relative">
                        <Bell size={18} />
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white" />
                    </button>
                    <button className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors">
                        <Settings size={18} />
                    </button>
                </div>

                {/* Profile Dropdown (Simplified) */}
                <div className="flex items-center gap-3 pl-3 border-l border-gray-200">
                    <div className="text-right hidden md:block">
                        <p className="text-sm font-semibold text-gray-900">{user?.name || 'Admin User'}</p>
                        <p className="text-xs text-gray-500">{user?.email || 'admin@r4.id'}</p>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-600 overflow-hidden">
                        <User size={18} />
                    </div>
                    <button
                        onClick={() => logout()}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                        title="Logout"
                    >
                        <LogOut size={16} />
                    </button>
                </div>
            </div>
        </nav>
    );
}
