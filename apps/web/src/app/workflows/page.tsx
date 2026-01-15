'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Workflow {
    id: string;
    name: string;
    description?: string;
    active: boolean;
    createdAt: string;
    updatedAt: string;
    nodeCount?: number;
}

export default function WorkflowsPage() {
    const [workflows, setWorkflows] = useState<Workflow[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newWorkflowName, setNewWorkflowName] = useState('');

    useEffect(() => {
        fetchWorkflows();
    }, []);

    const fetchWorkflows = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/workflows`);
            const data = await res.json();
            setWorkflows(data || []);
        } catch (error) {
            console.error('Failed to fetch workflows:', error);
            // Demo data
            setWorkflows([
                {
                    id: '1',
                    name: 'Tokopedia Order Sync',
                    description: 'Sync orders from Tokopedia to Google Sheets',
                    active: true,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    nodeCount: 5,
                },
                {
                    id: '2',
                    name: 'Instagram Auto Reply',
                    description: 'Auto reply to Instagram comments',
                    active: false,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    nodeCount: 3,
                },
                {
                    id: '3',
                    name: 'WhatsApp Notification',
                    description: 'Send WhatsApp notifications for new orders',
                    active: true,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    nodeCount: 4,
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const createWorkflow = async () => {
        if (!newWorkflowName.trim()) return;

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/workflows`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newWorkflowName, nodes: [], edges: [] }),
            });
            const newWorkflow = await res.json();
            setWorkflows([...workflows, newWorkflow]);
            setShowCreateModal(false);
            setNewWorkflowName('');
        } catch (error) {
            console.error('Failed to create workflow:', error);
        }
    };

    const deleteWorkflow = async (id: string) => {
        if (!confirm('Are you sure you want to delete this workflow?')) return;

        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/workflows/${id}`, {
                method: 'DELETE',
            });
            setWorkflows(workflows.filter(w => w.id !== id));
        } catch (error) {
            console.error('Failed to delete workflow:', error);
        }
    };

    const toggleActive = async (id: string, active: boolean) => {
        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/workflows/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ active: !active }),
            });
            setWorkflows(workflows.map(w => w.id === id ? { ...w, active: !active } : w));
        } catch (error) {
            console.error('Failed to toggle workflow:', error);
        }
    };

    return (
        <div className="min-h-screen bg-n8n-bg-dark">
            {/* Header */}
            <header className="bg-n8n-bg-darker border-b border-n8n-border px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-n8n-primary to-orange-600 flex items-center justify-center">
                            <span className="text-white font-bold">FA</span>
                        </div>
                        <div>
                            <h1 className="text-xl font-semibold text-n8n-text">FlowAutomator</h1>
                            <p className="text-xs text-n8n-text-muted">Workflows</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="px-4 py-2 bg-n8n-primary hover:bg-n8n-primary-hover text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        New Workflow
                    </button>
                </div>
            </header>

            {/* Content */}
            <main className="p-6">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-n8n-primary"></div>
                    </div>
                ) : workflows.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-n8n-bg-darker flex items-center justify-center">
                            <svg className="w-8 h-8 text-n8n-text-dim" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-semibold text-n8n-text mb-2">No workflows yet</h2>
                        <p className="text-n8n-text-muted mb-4">Create your first workflow to get started</p>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="px-4 py-2 bg-n8n-primary hover:bg-n8n-primary-hover text-white rounded-lg font-medium transition-colors"
                        >
                            Create Workflow
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {workflows.map((workflow) => (
                            <div
                                key={workflow.id}
                                className="bg-n8n-bg-darker rounded-xl border border-n8n-border p-5 hover:border-n8n-primary/50 transition-colors group"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-n8n-text group-hover:text-white transition-colors">
                                            {workflow.name}
                                        </h3>
                                        {workflow.description && (
                                            <p className="text-sm text-n8n-text-muted mt-1 line-clamp-2">
                                                {workflow.description}
                                            </p>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => toggleActive(workflow.id, workflow.active)}
                                        className={`w-10 h-6 rounded-full relative transition-colors ${workflow.active ? 'bg-green-500' : 'bg-n8n-bg-dark'
                                            }`}
                                    >
                                        <span
                                            className={`absolute w-4 h-4 rounded-full bg-white top-1 transition-all ${workflow.active ? 'right-1' : 'left-1'
                                                }`}
                                        />
                                    </button>
                                </div>

                                <div className="flex items-center gap-4 text-xs text-n8n-text-dim mb-4">
                                    <span className="flex items-center gap-1">
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                        </svg>
                                        {workflow.nodeCount || 0} nodes
                                    </span>
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${workflow.active ? 'bg-green-500/20 text-green-400' : 'bg-n8n-bg-dark text-n8n-text-dim'
                                        }`}>
                                        {workflow.active ? 'Active' : 'Inactive'}
                                    </span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Link
                                        href={`/editor/${workflow.id}`}
                                        className="flex-1 px-3 py-2 bg-n8n-bg-dark hover:bg-n8n-primary text-n8n-text hover:text-white rounded-lg text-sm font-medium text-center transition-colors"
                                    >
                                        Edit
                                    </Link>
                                    <button
                                        onClick={() => deleteWorkflow(workflow.id)}
                                        className="px-3 py-2 bg-n8n-bg-dark hover:bg-red-500/20 text-n8n-text-dim hover:text-red-400 rounded-lg transition-colors"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-n8n-bg-darker rounded-xl border border-n8n-border p-6 w-full max-w-md">
                        <h2 className="text-lg font-semibold text-n8n-text mb-4">Create New Workflow</h2>
                        <input
                            type="text"
                            value={newWorkflowName}
                            onChange={(e) => setNewWorkflowName(e.target.value)}
                            placeholder="Workflow name"
                            className="w-full px-4 py-3 bg-n8n-bg-dark border border-n8n-border rounded-lg text-n8n-text placeholder:text-n8n-text-dim focus:outline-none focus:border-n8n-primary"
                            autoFocus
                        />
                        <div className="flex gap-3 mt-4">
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="flex-1 px-4 py-2 bg-n8n-bg-dark hover:bg-n8n-border text-n8n-text rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={createWorkflow}
                                className="flex-1 px-4 py-2 bg-n8n-primary hover:bg-n8n-primary-hover text-white rounded-lg transition-colors"
                            >
                                Create
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
