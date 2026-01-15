'use client';

import { useState, useCallback } from 'react';

interface TopBarProps {
    workflowName: string;
    onNameChange: (name: string) => void;
    onSave: () => void;
    onExecute: () => void;
    isExecuting: boolean;
    isSaving: boolean;
    nodeCount: number;
    edgeCount: number;
}

export default function TopBar({
    workflowName,
    onNameChange,
    onSave,
    onExecute,
    isExecuting,
    isSaving,
    nodeCount,
    edgeCount,
}: TopBarProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState(workflowName);

    const handleNameSubmit = useCallback(() => {
        if (editName.trim()) {
            onNameChange(editName.trim());
        } else {
            setEditName(workflowName);
        }
        setIsEditing(false);
    }, [editName, workflowName, onNameChange]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleNameSubmit();
        } else if (e.key === 'Escape') {
            setEditName(workflowName);
            setIsEditing(false);
        }
    }, [handleNameSubmit, workflowName]);

    return (
        <div className="h-14 bg-n8n-bg-sidebar border-b border-n8n-border flex items-center justify-between px-4">
            {/* Left section - Workflow name */}
            <div className="flex items-center gap-4">
                {/* Back button */}
                <button className="p-2 rounded-lg hover:bg-n8n-bg-card transition-colors text-n8n-text-muted hover:text-n8n-text">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>

                {/* Workflow name */}
                <div className="flex items-center gap-2">
                    {isEditing ? (
                        <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            onBlur={handleNameSubmit}
                            onKeyDown={handleKeyDown}
                            autoFocus
                            className="n8n-input w-64 text-lg font-semibold"
                        />
                    ) : (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="text-lg font-semibold text-n8n-text hover:text-n8n-primary transition-colors flex items-center gap-2"
                        >
                            {workflowName}
                            <svg className="w-4 h-4 text-n8n-text-dim" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                        </button>
                    )}
                </div>

                {/* Stats */}
                <div className="flex items-center gap-3 text-sm text-n8n-text-dim">
                    <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                        </svg>
                        {nodeCount} nodes
                    </span>
                    <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                        {edgeCount} connections
                    </span>
                </div>
            </div>

            {/* Right section - Actions */}
            <div className="flex items-center gap-3">
                {/* Save button */}
                <button
                    onClick={onSave}
                    disabled={isSaving}
                    className="n8n-btn-secondary"
                >
                    {isSaving ? (
                        <>
                            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            Saving...
                        </>
                    ) : (
                        <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                            </svg>
                            Save
                        </>
                    )}
                </button>

                {/* Execute button */}
                <button
                    onClick={onExecute}
                    disabled={isExecuting || nodeCount === 0}
                    className={`n8n-btn ${isExecuting || nodeCount === 0
                        ? 'bg-n8n-text-dim cursor-not-allowed'
                        : 'n8n-btn-primary'
                        }`}
                >
                    {isExecuting ? (
                        <>
                            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            Executing...
                        </>
                    ) : (
                        <>
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                            </svg>
                            Execute
                        </>
                    )}
                </button>

                {/* Settings */}
                <button className="p-2 rounded-lg hover:bg-n8n-bg-card transition-colors text-n8n-text-muted hover:text-n8n-text">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
