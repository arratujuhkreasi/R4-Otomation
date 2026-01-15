/**
 * Credentials Module
 * 
 * Manages encrypted API credentials
 */

import { Module } from '@nestjs/common';
import { CredentialsController } from './credentials.controller';
import { CredentialsService } from './credentials.service';
import { CryptoService } from './crypto.service';
import { PrismaModule } from '../prisma';
import { AuthModule } from '../auth';

@Module({
    imports: [PrismaModule, AuthModule],
    controllers: [CredentialsController],
    providers: [CredentialsService, CryptoService],
    exports: [CredentialsService, CryptoService],
})
export class CredentialsModule { }
