'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function RegisterPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }

        setLoading(true);

        try {
            await register(email, password, name);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-n8n-bg-dark flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className The="text-center mb-8">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-n8n-primary to-orange-600 flex items-center justify-center">
                        <span className="text-white font-bold text-2xl">FA</span>
                    </div>
                    <h1 className="text-2xl font-bold text-n8n-text">FlowAutomator</h1>
                    <p className="text-n8n-text-muted mt-1">Create your account</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="bg-n8n-bg-darker rounded-xl border border-n8n-border p-6">
                    {error && (
                        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-n8n-text mb-1.5">
                                Name
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-3 bg-n8n-bg-dark border border-n8n-border rounded-lg text-n8n-text placeholder:text-n8n-text-dim focus:outline-none focus:border-n8n-primary focus:ring-1 focus:ring-n8n-primary/20 transition-all"
                                placeholder="John Doe"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-n8n-text mb-1.5">
                                Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full px-4 py-3 bg-n8n-bg-dark border border-n8n-border rounded-lg text-n8n-text placeholder:text-n8n-text-dim focus:outline-none focus:border-n8n-primary focus:ring-1 focus:ring-n8n-primary/20 transition-all"
                                placeholder="you@example.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-n8n-text mb-1.5">
                                Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full px-4 py-3 bg-n8n-bg-dark border border-n8n-border rounded-lg text-n8n-text placeholder:text-n8n-text-dim focus:outline-none focus:border-n8n-primary focus:ring-1 focus:ring-n8n-primary/20 transition-all"
                                placeholder="••••••••"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-n8n-text mb-1.5">
                                Confirm Password
                            </label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                className="w-full px-4 py-3 bg-n8n-bg-dark border border-n8n-border rounded-lg text-n8n-text placeholder:text-n8n-text-dim focus:outline-none focus:border-n8n-primary focus:ring-1 focus:ring-n8n-primary/20 transition-all"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full mt-6 px-4 py-3 bg-n8n-primary hover:bg-n8n-primary-hover disabled:opacity-50 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                        ) : null}
                        {loading ? 'Creating account...' : 'Create Account'}
                    </button>

                    <p className="mt-4 text-center text-sm text-n8n-text-muted">
                        Already have an account?{' '}
                        <Link href="/login" className="text-n8n-primary hover:underline">
                            Sign in
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
}
