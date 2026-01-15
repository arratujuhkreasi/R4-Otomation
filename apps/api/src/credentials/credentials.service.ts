/**
 * Credentials Service
 * 
 * Manages encrypted API credentials for node integrations
 */

import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma';
import { CryptoService } from './crypto.service';

interface CreateCredentialDto {
    name: string;
    type: string;
    data: Record<string, unknown>;
}

interface UpdateCredentialDto {
    name?: string;
    data?: Record<string, unknown>;
}

@Injectable()
export class CredentialsService {
    constructor(
        private prisma: PrismaService,
        private crypto: CryptoService,
    ) { }

    /**
     * Create a new credential
     */
    async create(userId: string, dto: CreateCredentialDto) {
        const encryptedData = this.crypto.encryptObject(dto.data);

        const credential = await this.prisma.credential.create({
            data: {
                userId,
                name: dto.name,
                type: dto.type,
                data: encryptedData,
            },
            select: {
                id: true,
                name: true,
                type: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        return credential;
    }

    /**
     * Get all credentials for a user (without decrypted data)
     */
    async findAll(userId: string) {
        return this.prisma.credential.findMany({
            where: { userId },
            select: {
                id: true,
                name: true,
                type: true,
                createdAt: true,
                updatedAt: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    /**
     * Get credential by ID (without decrypted data)
     */
    async findOne(userId: string, credentialId: string) {
        const credential = await this.prisma.credential.findUnique({
            where: { id: credentialId },
        });

        if (!credential) {
            throw new NotFoundException('Credential not found');
        }

        if (credential.userId !== userId) {
            throw new ForbiddenException('Access denied');
        }

        return {
            id: credential.id,
            name: credential.name,
            type: credential.type,
            createdAt: credential.createdAt,
            updatedAt: credential.updatedAt,
        };
    }

    /**
     * Get decrypted credential data (for node execution only)
     */
    async getDecryptedData(userId: string, credentialId: string): Promise<Record<string, unknown>> {
        const credential = await this.prisma.credential.findUnique({
            where: { id: credentialId },
        });

        if (!credential) {
            throw new NotFoundException('Credential not found');
        }

        if (credential.userId !== userId) {
            throw new ForbiddenException('Access denied');
        }

        return this.crypto.decryptObject(credential.data);
    }

    /**
     * Update credential
     */
    async update(userId: string, credentialId: string, dto: UpdateCredentialDto) {
        const credential = await this.prisma.credential.findUnique({
            where: { id: credentialId },
        });

        if (!credential) {
            throw new NotFoundException('Credential not found');
        }

        if (credential.userId !== userId) {
            throw new ForbiddenException('Access denied');
        }

        const updateData: { name?: string; data?: string } = {};

        if (dto.name) {
            updateData.name = dto.name;
        }

        if (dto.data) {
            updateData.data = this.crypto.encryptObject(dto.data);
        }

        const updated = await this.prisma.credential.update({
            where: { id: credentialId },
            data: updateData,
            select: {
                id: true,
                name: true,
                type: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        return updated;
    }

    /**
     * Delete credential
     */
    async delete(userId: string, credentialId: string) {
        const credential = await this.prisma.credential.findUnique({
            where: { id: credentialId },
        });

        if (!credential) {
            throw new NotFoundException('Credential not found');
        }

        if (credential.userId !== userId) {
            throw new ForbiddenException('Access denied');
        }

        await this.prisma.credential.delete({
            where: { id: credentialId },
        });

        return { success: true, message: 'Credential deleted' };
    }

    /**
     * Get credentials by type for a user
     */
    async findByType(userId: string, type: string) {
        return this.prisma.credential.findMany({
            where: { userId, type },
            select: {
                id: true,
                name: true,
                type: true,
                createdAt: true,
                updatedAt: true,
            },
        });
    }
}
