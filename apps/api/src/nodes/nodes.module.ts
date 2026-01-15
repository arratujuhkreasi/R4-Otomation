/**
 * Nodes Module
 * 
 * NestJS module for node management.
 */

import { Module } from '@nestjs/common';
import { NodesController } from './nodes.controller';

@Module({
    controllers: [NodesController],
    providers: [],
    exports: [],
})
export class NodesModule { }
