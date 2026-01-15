/**
 * Auth Service
 * 
 * Handles user registration, login, JWT token management
 */

import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma';

interface TokenPayload {
    sub: string;
    email: string;
    role: string;
}

interface AuthTokens {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}

@Injectable()
export class AuthService {
    private readonly SALT_ROUNDS = 12;
    private readonly ACCESS_TOKEN_EXPIRY = 15 * 60; // 15 minutes
    private readonly REFRESH_TOKEN_EXPIRY = 7 * 24 * 60 * 60; // 7 days

    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
    ) { }

    /**
     * Register a new user
     */
    async register(email: string, password: string, name?: string) {
        // Check if user exists
        const existingUser = await this.prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            throw new ConflictException('Email already registered');
        }

        // Validate password
        if (password.length < 8) {
            throw new BadRequestException('Password must be at least 8 characters');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, this.SALT_ROUNDS);

        // Create user
        const user = await this.prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                verifyToken: crypto.randomBytes(32).toString('hex'),
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                createdAt: true,
            },
        });

        return {
            success: true,
            message: 'Registration successful',
            user,
        };
    }

    /**
     * Login user
     */
    async login(email: string, password: string, userAgent?: string, ipAddress?: string): Promise<AuthTokens> {
        // Find user
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // Verify password
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // Update last login
        await this.prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
        });

        // Generate tokens
        return this.generateTokens(user.id, user.email, user.role, userAgent, ipAddress);
    }

    /**
     * Refresh access token
     */
    async refreshToken(refreshToken: string): Promise<AuthTokens> {
        // Find session
        const session = await this.prisma.session.findUnique({
            where: { refreshToken },
            include: { user: true },
        });

        if (!session || session.expiresAt < new Date()) {
            throw new UnauthorizedException('Invalid or expired refresh token');
        }

        // Delete old session
        await this.prisma.session.delete({ where: { id: session.id } });

        // Generate new tokens
        return this.generateTokens(
            session.user.id,
            session.user.email,
            session.user.role,
            session.userAgent || undefined,
            session.ipAddress || undefined,
        );
    }

    /**
     * Logout user
     */
    async logout(refreshToken: string) {
        await this.prisma.session.deleteMany({
            where: { refreshToken },
        });
        return { success: true, message: 'Logged out successfully' };
    }

    /**
     * Logout from all devices
     */
    async logoutAll(userId: string) {
        await this.prisma.session.deleteMany({
            where: { userId },
        });
        return { success: true, message: 'Logged out from all devices' };
    }

    /**
     * Get user by ID
     */
    async getUserById(userId: string) {
        return this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                emailVerified: true,
                createdAt: true,
                lastLoginAt: true,
            },
        });
    }

    /**
     * Change password
     */
    async changePassword(userId: string, currentPassword: string, newPassword: string) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        const isValid = await bcrypt.compare(currentPassword, user.password);
        if (!isValid) {
            throw new UnauthorizedException('Current password is incorrect');
        }

        if (newPassword.length < 8) {
            throw new BadRequestException('New password must be at least 8 characters');
        }

        const hashedPassword = await bcrypt.hash(newPassword, this.SALT_ROUNDS);
        await this.prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword },
        });

        // Invalidate all sessions
        await this.prisma.session.deleteMany({ where: { userId } });

        return { success: true, message: 'Password changed successfully' };
    }

    /**
     * Generate access and refresh tokens
     */
    private async generateTokens(
        userId: string,
        email: string,
        role: string,
        userAgent?: string,
        ipAddress?: string,
    ): Promise<AuthTokens> {
        const payload: TokenPayload = {
            sub: userId,
            email,
            role,
        };

        const accessToken = this.jwtService.sign(payload, {
            expiresIn: this.ACCESS_TOKEN_EXPIRY,
        });

        const refreshToken = crypto.randomBytes(64).toString('hex');

        // Store refresh token in database
        await this.prisma.session.create({
            data: {
                userId,
                refreshToken,
                userAgent,
                ipAddress,
                expiresAt: new Date(Date.now() + this.REFRESH_TOKEN_EXPIRY * 1000),
            },
        });

        return {
            accessToken,
            refreshToken,
            expiresIn: this.ACCESS_TOKEN_EXPIRY,
        };
    }

    /**
     * Validate JWT payload
     */
    async validateUser(payload: TokenPayload) {
        return this.prisma.user.findUnique({
            where: { id: payload.sub },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
            },
        });
    }
}
