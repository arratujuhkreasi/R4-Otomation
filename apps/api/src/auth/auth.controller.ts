/**
 * Auth Controller
 * 
 * API endpoints for authentication
 */

import {
    Controller,
    Post,
    Get,
    Body,
    UseGuards,
    Req,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Request } from 'express';

interface RegisterDto {
    email: string;
    password: string;
    name?: string;
}

interface LoginDto {
    email: string;
    password: string;
}

interface RefreshDto {
    refreshToken: string;
}

interface ChangePasswordDto {
    currentPassword: string;
    newPassword: string;
}

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    /**
     * Register new user
     */
    @Post('register')
    async register(@Body() dto: RegisterDto) {
        return this.authService.register(dto.email, dto.password, dto.name);
    }

    /**
     * Login user
     */
    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(@Body() dto: LoginDto, @Req() req: Request) {
        const userAgent = req.headers['user-agent'];
        const ipAddress = req.ip || req.socket.remoteAddress;
        return this.authService.login(dto.email, dto.password, userAgent, ipAddress);
    }

    /**
     * Refresh access token
     */
    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    async refresh(@Body() dto: RefreshDto) {
        return this.authService.refreshToken(dto.refreshToken);
    }

    /**
     * Logout
     */
    @Post('logout')
    @HttpCode(HttpStatus.OK)
    async logout(@Body() dto: RefreshDto) {
        return this.authService.logout(dto.refreshToken);
    }

    /**
     * Logout from all devices
     */
    @Post('logout-all')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    async logoutAll(@Req() req: Request) {
        const user = req.user as { id: string };
        return this.authService.logoutAll(user.id);
    }

    /**
     * Get current user profile
     */
    @Get('me')
    @UseGuards(JwtAuthGuard)
    async getMe(@Req() req: Request) {
        const user = req.user as { id: string };
        return this.authService.getUserById(user.id);
    }

    /**
     * Change password
     */
    @Post('change-password')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    async changePassword(@Body() dto: ChangePasswordDto, @Req() req: Request) {
        const user = req.user as { id: string };
        return this.authService.changePassword(user.id, dto.currentPassword, dto.newPassword);
    }
}
