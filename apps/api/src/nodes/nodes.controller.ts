/**
 * Nodes Controller
 * 
 * API endpoints for retrieving node information.
 */

import { Controller, Get, Param, Query } from '@nestjs/common';
import { nodeRegistry } from './NodeRegistry';

@Controller('nodes')
export class NodesController {
    /**
     * Get all available nodes
     */
    @Get()
    getAllNodes() {
        return {
            success: true,
            data: nodeRegistry.getNodeMetadata(),
            count: nodeRegistry.getAll().length,
        };
    }

    /**
     * Get nodes grouped by category
     */
    @Get('categories')
    getNodesByCategory() {
        const grouped = nodeRegistry.getGroupedByCategory();

        return {
            success: true,
            data: Object.entries(grouped).map(([category, nodes]) => ({
                category,
                nodes: nodes.map(n => ({
                    name: n.name,
                    displayName: n.displayName,
                    description: n.description,
                    icon: n.icon,
                })),
            })),
        };
    }

    /**
     * Search nodes
     */
    @Get('search')
    searchNodes(@Query('q') query: string) {
        if (!query) {
            return { success: false, error: 'Query parameter "q" is required' };
        }

        const results = nodeRegistry.search(query);

        return {
            success: true,
            data: results.map(n => ({
                name: n.name,
                displayName: n.displayName,
                description: n.description,
                category: n.category,
                icon: n.icon,
            })),
            count: results.length,
        };
    }

    /**
     * Get specific node by name
     */
    @Get(':name')
    getNode(@Param('name') name: string) {
        const node = nodeRegistry.get(name);

        if (!node) {
            return { success: false, error: `Node "${name}" not found` };
        }

        return {
            success: true,
            data: {
                name: node.name,
                displayName: node.displayName,
                description: node.description,
                category: node.category,
                version: node.version,
                icon: node.icon,
                defaults: node.defaults,
                inputs: node.inputs,
                outputs: node.outputs,
                outputNames: node.outputNames,
                credentials: node.credentials,
                properties: node.properties,
            },
        };
    }
}
