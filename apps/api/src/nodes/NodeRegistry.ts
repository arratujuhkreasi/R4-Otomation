/**
 * Node Registry
 * 
 * Central registry for all available nodes in FlowAutomator.
 */

import { INode } from './Node.interface';

// Import node implementations
import { httpRequestNode } from './implementations/HttpRequestNode';
import { telegramBotNode } from './implementations/TelegramBotNode';
import { whatsappNode } from './implementations/whatsapp';
import { emailNode } from './implementations/email';
import { tokopediaNode } from './implementations/tokopedia';
import { shopeeNode } from './implementations/shopee';
import { bukalapakNode } from './implementations/bukalapak';
import { lazadaNode } from './implementations/lazada';
import { instagramNode } from './implementations/instagram';
import { tiktokNode } from './implementations/tiktok';
import { facebookNode } from './implementations/facebook';
import { twitterNode } from './implementations/twitter';
import { googleSheetsNode } from './implementations/googlesheets';

class NodeRegistry {
    private nodes: Map<string, INode> = new Map();
    private static instance: NodeRegistry;

    private constructor() {
        this.registerBuiltInNodes();
    }

    static getInstance(): NodeRegistry {
        if (!NodeRegistry.instance) {
            NodeRegistry.instance = new NodeRegistry();
        }
        return NodeRegistry.instance;
    }

    private registerBuiltInNodes(): void {
        // Core
        this.register(httpRequestNode);

        // Messaging
        this.register(telegramBotNode);
        this.register(whatsappNode);
        this.register(emailNode);

        // Indonesian Marketplaces
        this.register(tokopediaNode);
        this.register(shopeeNode);
        this.register(bukalapakNode);
        this.register(lazadaNode);

        // Social Media
        this.register(instagramNode);
        this.register(tiktokNode);
        this.register(facebookNode);
        this.register(twitterNode);

        // Utilities
        this.register(googleSheetsNode);
    }

    register(node: INode): void {
        if (this.nodes.has(node.name)) {
            console.warn(`Node ${node.name} already registered. Overwriting.`);
        }
        this.nodes.set(node.name, node);
        console.log(`✓ Registered: ${node.displayName} (${node.name})`);
    }

    get(name: string): INode | undefined {
        return this.nodes.get(name);
    }

    has(name: string): boolean {
        return this.nodes.has(name);
    }

    getAll(): INode[] {
        return Array.from(this.nodes.values());
    }

    getByCategory(category: string): INode[] {
        return this.getAll().filter(n => n.category === category);
    }

    getNodeMetadata() {
        return this.getAll().map(n => ({
            name: n.name,
            displayName: n.displayName,
            description: n.description,
            category: n.category,
            icon: n.icon,
            properties: n.properties,
            credentials: n.credentials,
        }));
    }

    search(query: string): INode[] {
        const q = query.toLowerCase();
        return this.getAll().filter(
            n => n.name.toLowerCase().includes(q) ||
                n.displayName.toLowerCase().includes(q) ||
                n.description.toLowerCase().includes(q)
        );
    }

    getGroupedByCategory(): Record<string, INode[]> {
        const grouped: Record<string, INode[]> = {};
        for (const node of this.getAll()) {
            if (!grouped[node.category]) grouped[node.category] = [];
            grouped[node.category].push(node);
        }
        return grouped;
    }
}

export const nodeRegistry = NodeRegistry.getInstance();
export { NodeRegistry };
