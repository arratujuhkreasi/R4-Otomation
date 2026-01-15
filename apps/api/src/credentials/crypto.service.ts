/**
 * Crypto Service
 * 
 * AES-256-GCM encryption for sensitive credential data
 */

import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class CryptoService {
    private readonly algorithm = 'aes-256-gcm';
    private readonly keyLength = 32; // 256 bits
    private readonly ivLength = 16;
    private readonly authTagLength = 16;

    /**
     * Get encryption key from environment or generate one
     */
    private getEncryptionKey(): Buffer {
        const envKey = process.env.ENCRYPTION_KEY;
        if (envKey && envKey.length >= this.keyLength) {
            return Buffer.from(envKey.slice(0, this.keyLength), 'utf-8');
        }
        // Fallback (should be set in production!)
        return crypto.scryptSync('default-secret-key-change-in-prod', 'salt', this.keyLength);
    }

    /**
     * Encrypt data using AES-256-GCM
     */
    encrypt(plaintext: string): string {
        const key = this.getEncryptionKey();
        const iv = crypto.randomBytes(this.ivLength);

        const cipher = crypto.createCipheriv(this.algorithm, key, iv);

        let encrypted = cipher.update(plaintext, 'utf8', 'hex');
        encrypted += cipher.final('hex');

        const authTag = cipher.getAuthTag();

        // Format: iv:authTag:encryptedData
        return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
    }

    /**
     * Decrypt data using AES-256-GCM
     */
    decrypt(ciphertext: string): string {
        const key = this.getEncryptionKey();

        const parts = ciphertext.split(':');
        if (parts.length !== 3) {
            throw new Error('Invalid encrypted data format');
        }

        const iv = Buffer.from(parts[0], 'hex');
        const authTag = Buffer.from(parts[1], 'hex');
        const encrypted = parts[2];

        const decipher = crypto.createDecipheriv(this.algorithm, key, iv);
        decipher.setAuthTag(authTag);

        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    }

    /**
     * Encrypt JSON object
     */
    encryptObject(obj: Record<string, unknown>): string {
        return this.encrypt(JSON.stringify(obj));
    }

    /**
     * Decrypt JSON object
     */
    decryptObject<T = Record<string, unknown>>(ciphertext: string): T {
        const decrypted = this.decrypt(ciphertext);
        return JSON.parse(decrypted) as T;
    }

    /**
     * Hash a value (one-way, for API keys)
     */
    hash(value: string): string {
        return crypto.createHash('sha256').update(value).digest('hex');
    }

    /**
     * Generate a secure random API key
     */
    generateApiKey(): string {
        return crypto.randomBytes(32).toString('base64url');
    }
}
