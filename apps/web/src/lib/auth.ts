/**
 * JWT utilities for authentication
 */

import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret';
const SALT_ROUNDS = 12;

interface TokenPayload {
    sub: string;
    email: string;
    role: string;
}

export function signToken(payload: TokenPayload, expiresIn = '15m'): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

export function verifyToken(token: string): TokenPayload | null {
    try {
        return jwt.verify(token, JWT_SECRET) as TokenPayload;
    } catch {
        return null;
    }
}

export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
}

export function getTokenFromRequest(req: NextRequest): string | null {
    const authHeader = req.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
        return authHeader.substring(7);
    }
    return null;
}

export function getUserFromRequest(req: NextRequest): TokenPayload | null {
    const token = getTokenFromRequest(req);
    if (!token) return null;
    return verifyToken(token);
}

export function generateRefreshToken(): string {
    return require('crypto').randomBytes(64).toString('hex');
}
