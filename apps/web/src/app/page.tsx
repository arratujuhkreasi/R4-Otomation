'use client';

import { useCallback, useMemo, useState, useEffect } from 'react';
import WorkflowCanvas from '@/components/WorkflowCanvas';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import ConfigPanel from '@/components/ConfigPanel';
import { useWorkflowStore, FlowNode } from '@/store/workflow-store';
import { useExecution } from '@/hooks/useExecution';
import TemplateGallery from '@/components/TemplateGallery';
import NodeConfigSidebar from '@/components/NodeConfigSidebar';

export default function Home() {
    const {
        nodes,
        edges,
        metadata,
        selectedNodeId,
        isSaving,
        addNode,
        updateNodeData,
        setMetadata,
        setIsSaving,
        setSelectedNodeId,
    } = useWorkflowStore();

    const {
        isConnected,
        isExecuting,
        nodeResults,
        error,
        execute,
        reset,
    } = useExecution();

    // Get selected node
    const selectedNode = useMemo(() => {
        if (!selectedNodeId) return null;
        const node = nodes.find((n) => n.id === selectedNodeId);
        if (!node) return null;
        return {
            id: node.id,
            type: node.type || 'actionNode',
            data: node.data,
        };
    }, [selectedNodeId, nodes]);



    // Handle adding node from sidebar
    const handleAddNode = useCallback((type: string, label: string) => {
        const newNode: FlowNode = {
            id: `${type}-${Date.now()}`,
            type,
            position: {
                x: Math.random() * 300 + 200,
                y: Math.random() * 200 + 100,
            },
            data: { label },
        };
        addNode(newNode);
    }, [addNode]);

    // Handle node data update from config panel
    const handleUpdateNode = useCallback((nodeId: string, data: Record<string, any>) => {
        updateNodeData(nodeId, data);
    }, [updateNodeData]);

    // Handle workflow name change
    const handleNameChange = useCallback((name: string) => {
        setMetadata({ name });
    }, [setMetadata]);

    // State for workflow ID
    const [workflowId, setWorkflowId] = useState<string | null>(null);

    // State for UI
    const [showGallery, setShowGallery] = useState(true);
    const [isConfigOpen, setIsConfigOpen] = useState(false);

    // Initial load check
    useEffect(() => {
        // If URL has ID, show canvas immediately
        if (window.location.pathname.includes('/workflow/')) {
            setShowGallery(false);
        }
    }, []);

    // Handle template selection
    const handleSelectTemplate = useCallback((templateId: string) => {
        // Mock loading template
        if (templateId === 'blank') {
            // Reset to empty
            // clearNodes(); // Need to implement clear in store or just reload
        } else if (templateId === 'tpl_reply_shopee') {
            // Load Shopee Template
            const mockNodes: FlowNode[] = [
                { id: 'trigger-1', type: 'shopeeNode', position: { x: 100, y: 200 }, data: { label: 'Shopee - Chat Masuk' } },
                { id: 'ai-1', type: 'codeNode', position: { x: 400, y: 200 }, data: { label: 'AI - Generate Reply' } },
                { id: 'action-1', type: 'shopeeNode', position: { x: 700, y: 200 }, data: { label: 'Shopee - Kirim Balasan' } },
            ];
            // Add nodes to store (We need a setNodes action in store, or add one by one)
            // For MVP, letting user start blank or just console log
            console.log('Loading Shopee template...');
            // In real app: setNodes(mockNodes);
            nodes.length = 0; // Hacky clear for demo
            mockNodes.forEach(n => addNode(n));
        }

        setShowGallery(false);
    }, [addNode, nodes]);

    // Handle node select (open sidebar)
    const handleNodeSelect = useCallback((nodeId: string | null) => {
        setSelectedNodeId(nodeId);
        if (nodeId) {
            setIsConfigOpen(true);
        } else {
            setIsConfigOpen(false);
        }
    }, [setSelectedNodeId]);

    // Handle save
    const handleSave = useCallback(async () => {
        setIsSaving(true);
        try {
            const token = localStorage.getItem('accessToken');
            const method = workflowId ? 'PUT' : 'POST';
            const url = workflowId ? `/api/workflows/${workflowId}` : '/api/workflows';

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name: metadata.name,
                    nodes,
                    edges,
                }),
            });

            if (!res.ok) throw new Error('Failed to save');

            const data = await res.json();

            if (!workflowId) {
                setWorkflowId(data.id);
                // Optional: Update URL without reload
                window.history.pushState({}, '', `/workflow/${data.id}`);
            }

            // alert('Workflow saved successfully!'); 
        } catch (error) {
            console.error('Save error:', error);
            alert('Failed to save workflow');
        } finally {
            setIsSaving(false);
        }
    }, [workflowId, metadata.name, nodes, edges, setIsSaving]);

    // Handle execute
    const handleExecute = useCallback(() => {
        reset();
        execute(nodes, edges);
    }, [nodes, edges, execute, reset]);

    if (showGallery) {
        return <TemplateGallery onSelectTemplate={handleSelectTemplate} />;
    }

    return (
        <main className="h-screen w-screen overflow-hidden bg-n8n-bg-dark flex">
            {/* Left Sidebar */}
            <Sidebar onAddNode={handleAddNode} />

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top Bar */}
                <TopBar
                    workflowName={metadata.name}
                    onNameChange={handleNameChange}
                    onSave={handleSave}
                    onExecute={handleExecute}
                    isExecuting={isExecuting}
                    isSaving={isSaving}
                    nodeCount={nodes.length}
                    edgeCount={edges.length}
                />

                {/* Canvas */}
                <div className="flex-1 overflow-hidden relative">
                    <WorkflowCanvas onNodeSelect={handleNodeSelect} />
                </div>
            </div>

            {/* Right Config Sidebar (Slide-over) */}
            <NodeConfigSidebar
                isOpen={isConfigOpen}
                onClose={() => setIsConfigOpen(false)}
                selectedNode={selectedNode}
                onUpdateNode={handleUpdateNode}
            />
        </main>
    );
}
