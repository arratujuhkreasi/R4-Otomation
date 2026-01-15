import { Module } from '@nestjs/common';
import { ExecutionService } from './execution.service';
import { ExecutionController } from './execution.controller';
import { ExecutionGateway } from './execution.gateway';
import { HttpRequestExecutor } from './executors/http-request.executor';

@Module({
    controllers: [ExecutionController],
    providers: [ExecutionService, ExecutionGateway, HttpRequestExecutor],
    exports: [ExecutionService],
})
export class ExecutionModule { }
