'use client';

import { useCallback, useMemo } from 'react';
import ReactFlow, {
    Background,
    BackgroundVariant,
    Controls,
    MiniMap,
    NodeMouseHandler,
    ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { useWorkflowStore, FlowNode } from '@/store/workflow-store';
import {
    ActionNode,
    TriggerNode,
    HttpRequestNode,
    CodeNode,
    IfNode,
    SetNode,
    TokopediaNode,
    ShopeeNode,
    InstagramNode,
    TikTokNode,
    WhatsAppNode,
    TelegramNode,
    GoogleSheetsNode,
} from '@/components/nodes';
import { useExecution } from '@/hooks/useExecution';

// Register custom node types
const nodeTypes = {
    // Core nodes
    actionNode: ActionNode,
    triggerNode: TriggerNode,
    httpRequestNode: HttpRequestNode,
    codeNode: CodeNode,
    ifNode: IfNode,
    setNode: SetNode,
    scheduleNode: TriggerNode,
    manualTrigger: TriggerNode,
    switchNode: IfNode,
    mergeNode: SetNode,
    loopNode: IfNode,
    splitNode: SetNode,
    aggregateNode: SetNode,
    webhookResponse: ActionNode,

    // Marketplace Indonesia
    tokopediaNode: TokopediaNode,
    shopeeNode: ShopeeNode,
    bukalapakNode: TokopediaNode, // Use same style
    lazadaNode: ShopeeNode, // Use same style

    // Social Media
    instagramNode: InstagramNode,
    tiktokNode: TikTokNode,
    facebookNode: InstagramNode, // Use same style
    twitterNode: TikTokNode, // Use same style

    // Messaging
    whatsappNode: WhatsAppNode,
    telegramNode: TelegramNode,
    emailNode: TelegramNode, // Use same style

    // Data Storage
    googleSheetsNode: GoogleSheetsNode,
    mysqlNode: GoogleSheetsNode,
    postgresNode: GoogleSheetsNode,
    mongodbNode: GoogleSheetsNode,
};

// Custom edge styling - n8n style
const defaultEdgeOptions = {
    style: { strokeWidth: 2, stroke: '#4a4a4a' },
    type: 'smoothstep',
    animated: true,
};

interface WorkflowCanvasProps {
    onNodeSelect: (nodeId: string | null) => void;
}

function WorkflowCanvasInner({ onNodeSelect }: WorkflowCanvasProps) {
    const {
        nodes,
        edges,
        onNodesChange,
        onEdgesChange,
        onConnect,
        addNode,
        setSelectedNodeId,
    } = useWorkflowStore();

    const {
        nodeResults,
    } = useExecution();

    // Handle node click for selection
    const handleNodeClick: NodeMouseHandler = useCallback((_, node) => {
        setSelectedNodeId(node.id);
        onNodeSelect(node.id);
    }, [setSelectedNodeId, onNodeSelect]);

    // Handle canvas click to deselect
    const handlePaneClick = useCallback(() => {
        setSelectedNodeId(null);
        onNodeSelect(null);
    }, [setSelectedNodeId, onNodeSelect]);

    // Handle drag and drop from sidebar
    const handleDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const handleDrop = useCallback((event: React.DragEvent) => {
        event.preventDefault();

        const data = event.dataTransfer.getData('application/reactflow');
        if (!data) return;

        const { type, label } = JSON.parse(data);

        // Get canvas bounds
        const reactFlowBounds = (event.target as HTMLElement).closest('.react-flow')?.getBoundingClientRect();
        if (!reactFlowBounds) return;

        const position = {
            x: event.clientX - reactFlowBounds.left - 90,
            y: event.clientY - reactFlowBounds.top - 25,
        };

        const newNode: FlowNode = {
            id: `${type}-${Date.now()}`,
            type,
            position,
            data: { label },
        };

        addNode(newNode);
    }, [addNode]);

    // Enhance nodes with execution status
    const enhancedNodes = useMemo(() => {
        return nodes.map((node) => {
            const result = nodeResults.find((r) => r.nodeId === node.id);
            return {
                ...node,
                data: {
                    ...node.data,
                    status: result?.status || 'idle',
                },
            };
        });
    }, [nodes, nodeResults]);

    return (
        <div className="w-full h-full" onDragOver={handleDragOver} onDrop={handleDrop}>
            <ReactFlow
                nodes={enhancedNodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodeClick={handleNodeClick}
                onPaneClick={handlePaneClick}
                nodeTypes={nodeTypes}
                defaultEdgeOptions={defaultEdgeOptions}
                fitView
                fitViewOptions={{ padding: 0.2 }}
                className="bg-n8n-bg-dark"
                proOptions={{ hideAttribution: true }}
            >
                {/* Background Grid - n8n style dots */}
                <Background
                    variant={BackgroundVariant.Dots}
                    gap={20}
                    size={1}
                    color="#2a2a2a"
                />

                {/* Mini Map */}
                <MiniMap
                    nodeColor={(node) => {
                        const colors: Record<string, string> = {
                            triggerNode: '#9b59b6',
                            scheduleNode: '#9b59b6',
                            manualTrigger: '#9b59b6',
                            httpRequestNode: '#3498db',
                            actionNode: '#3498db',
                            ifNode: '#e67e22',
                            switchNode: '#e67e22',
                            codeNode: '#2ecc71',
                            setNode: '#1abc9c',
                            mergeNode: '#1abc9c',
                            // Marketplace
                            tokopediaNode: '#42b549',
                            shopeeNode: '#EE4D2D',
                            bukalapakNode: '#E31E52',
                            lazadaNode: '#0F146D',
                            // Social Media
                            instagramNode: '#E4405F',
                            tiktokNode: '#000000',
                            facebookNode: '#1877F2',
                            twitterNode: '#1DA1F2',
                            // Messaging
                            whatsappNode: '#25D366',
                            telegramNode: '#0088cc',
                            emailNode: '#EA4335',
                            // Data
                            googleSheetsNode: '#0F9D58',
                        };
                        return colors[node.type || ''] || '#64748b';
                    }}
                    maskColor="rgba(0, 0, 0, 0.4)"
                    style={{
                        backgroundColor: '#262626',
                        border: '1px solid #3d3d3d',
                        borderRadius: '8px',
                    }}
                />

                {/* Controls */}
                <Controls
                    showInteractive={false}
                    style={{
                        backgroundColor: '#262626',
                        border: '1px solid #3d3d3d',
                        borderRadius: '8px',
                    }}
                />
            </ReactFlow>
        </div>
    );
}

export default function WorkflowCanvas(props: WorkflowCanvasProps) {
    return (
        <ReactFlowProvider>
            <WorkflowCanvasInner {...props} />
        </ReactFlowProvider>
    );
}
