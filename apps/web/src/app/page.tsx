'use client';

import { useCallback, useMemo } from 'react';
import WorkflowCanvas from '@/components/WorkflowCanvas';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import ConfigPanel from '@/components/ConfigPanel';
import { useWorkflowStore, FlowNode } from '@/store/workflow-store';
import { useExecution } from '@/hooks/useExecution';

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

    // Handle node selection from canvas
    const handleNodeSelect = useCallback((nodeId: string | null) => {
        setSelectedNodeId(nodeId);
    }, [setSelectedNodeId]);

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

    // Handle save
    const handleSave = useCallback(async () => {
        setIsSaving(true);
        // Simulate save
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setIsSaving(false);
    }, [setIsSaving]);

    // Handle execute
    const handleExecute = useCallback(() => {
        reset();
        execute(nodes, edges);
    }, [nodes, edges, execute, reset]);

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
                <div className="flex-1 overflow-hidden">
                    <WorkflowCanvas onNodeSelect={handleNodeSelect} />
                </div>
            </div>

            {/* Right Config Panel */}
            <ConfigPanel
                selectedNode={selectedNode}
                onUpdateNode={handleUpdateNode}
                executionResults={nodeResults}
            />
        </main>
    );
}
