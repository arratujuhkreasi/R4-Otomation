'use client';

import { create } from 'zustand';
import {
    Connection,
    Edge,
    EdgeChange,
    Node,
    NodeChange,
    addEdge,
    applyNodeChanges,
    applyEdgeChanges,
} from 'reactflow';

// Node data types for different node types
export interface BaseNodeData {
    label: string;
    [key: string]: any;
}

export interface TriggerNodeData extends BaseNodeData {
    path?: string;
    triggerType?: 'webhook' | 'manual' | 'schedule';
    cron?: string;
}

export interface HttpRequestNodeData extends BaseNodeData {
    url?: string;
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    headers?: Record<string, string>;
    body?: string;
}

export interface CodeNodeData extends BaseNodeData {
    code?: string;
    language?: 'javascript' | 'python';
}

export interface IfNodeData extends BaseNodeData {
    condition?: string;
}

export interface SetNodeData extends BaseNodeData {
    fieldName?: string;
    fieldValue?: string;
}

export type FlowNodeData = TriggerNodeData | HttpRequestNodeData | CodeNodeData | IfNodeData | SetNodeData | BaseNodeData;
export type FlowNode = Node<FlowNodeData>;

interface WorkflowMetadata {
    name: string;
    description?: string;
    active: boolean;
}

interface WorkflowState {
    // Workflow metadata
    metadata: WorkflowMetadata;

    // Canvas state
    nodes: FlowNode[];
    edges: Edge[];
    selectedNodeId: string | null;

    // UI State
    isSaving: boolean;

    // Actions
    onNodesChange: (changes: NodeChange[]) => void;
    onEdgesChange: (changes: EdgeChange[]) => void;
    onConnect: (connection: Connection) => void;
    addNode: (node: FlowNode) => void;
    updateNodeData: (nodeId: string, data: Partial<FlowNodeData>) => void;
    deleteNode: (nodeId: string) => void;
    setSelectedNodeId: (nodeId: string | null) => void;
    setNodes: (nodes: FlowNode[]) => void;
    setEdges: (edges: Edge[]) => void;
    setMetadata: (metadata: Partial<WorkflowMetadata>) => void;
    setIsSaving: (isSaving: boolean) => void;
}

// Initial demo nodes
const initialNodes: FlowNode[] = [
    {
        id: 'trigger-1',
        type: 'triggerNode',
        position: { x: 100, y: 200 },
        data: {
            label: 'Webhook',
            triggerType: 'webhook',
            path: '/api/webhook'
        },
    },
    {
        id: 'http-1',
        type: 'httpRequestNode',
        position: { x: 350, y: 150 },
        data: {
            label: 'HTTP Request',
            url: 'https://api.example.com/data',
            method: 'GET'
        },
    },
    {
        id: 'if-1',
        type: 'ifNode',
        position: { x: 600, y: 200 },
        data: {
            label: 'Check Status',
            condition: '{{ $json.status }} === 200'
        },
    },
    {
        id: 'set-1',
        type: 'setNode',
        position: { x: 850, y: 100 },
        data: {
            label: 'Format Data',
            fieldName: 'result',
            fieldValue: '{{ $json.data }}'
        },
    },
    {
        id: 'code-1',
        type: 'codeNode',
        position: { x: 850, y: 300 },
        data: {
            label: 'Process Error',
            code: 'console.log("Error:", $json);',
            language: 'javascript'
        },
    },
];

const initialEdges: Edge[] = [
    { id: 'e1-2', source: 'trigger-1', target: 'http-1', animated: true },
    { id: 'e2-3', source: 'http-1', target: 'if-1', animated: true },
    { id: 'e3-4', source: 'if-1', target: 'set-1', sourceHandle: 'true', animated: true },
    { id: 'e3-5', source: 'if-1', target: 'code-1', sourceHandle: 'false', animated: true },
];

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
    metadata: {
        name: 'My Workflow',
        description: '',
        active: false,
    },
    nodes: initialNodes,
    edges: initialEdges,
    selectedNodeId: null,
    isSaving: false,

    onNodesChange: (changes) => {
        set({
            nodes: applyNodeChanges(changes, get().nodes),
        });
    },

    onEdgesChange: (changes) => {
        set({
            edges: applyEdgeChanges(changes, get().edges),
        });
    },

    onConnect: (connection) => {
        set({
            edges: addEdge({ ...connection, animated: true }, get().edges),
        });
    },

    addNode: (node) => {
        set({
            nodes: [...get().nodes, node],
        });
    },

    updateNodeData: (nodeId, data) => {
        set({
            nodes: get().nodes.map((node) =>
                node.id === nodeId
                    ? { ...node, data: { ...node.data, ...data } }
                    : node
            ),
        });
    },

    deleteNode: (nodeId) => {
        set({
            nodes: get().nodes.filter((node) => node.id !== nodeId),
            edges: get().edges.filter(
                (edge) => edge.source !== nodeId && edge.target !== nodeId
            ),
            selectedNodeId: get().selectedNodeId === nodeId ? null : get().selectedNodeId,
        });
    },

    setSelectedNodeId: (nodeId) => {
        set({ selectedNodeId: nodeId });
    },

    setNodes: (nodes) => set({ nodes }),
    setEdges: (edges) => set({ edges }),

    setMetadata: (metadata) => {
        set({
            metadata: { ...get().metadata, ...metadata },
        });
    },

    setIsSaving: (isSaving) => set({ isSaving }),
}));
