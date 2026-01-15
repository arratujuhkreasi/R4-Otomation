import { Module } from '@nestjs/common';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './prisma';
import { WorkflowsModule } from './workflows/workflows.module';
import { ExecutionModule } from './execution';
import { NodesModule } from './nodes/nodes.module';
import { AuthModule } from './auth';
import { CredentialsModule } from './credentials';
import { HealthModule } from './health';

@Module({
    imports: [
        // Rate Limiting - 100 requests per minute per IP
        ThrottlerModule.forRoot([{
            ttl: 60000,
            limit: 100,
        }]),

        // Core modules
        PrismaModule,
        AuthModule,
        CredentialsModule,
        WorkflowsModule,
        ExecutionModule,
        NodesModule,
        HealthModule,
    ],
    providers: [
        {
            provide: APP_GUARD,
            useClass: ThrottlerGuard,
        },
    ],
})
export class AppModule { }
