/**
 * Credentials Controller
 */

import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    UseGuards,
    Req,
} from '@nestjs/common';
import { CredentialsService } from './credentials.service';
import { JwtAuthGuard } from '../auth';
import { Request } from 'express';

interface CreateCredentialDto {
    name: string;
    type: string;
    data: Record<string, unknown>;
}

interface UpdateCredentialDto {
    name?: string;
    data?: Record<string, unknown>;
}

@Controller('credentials')
@UseGuards(JwtAuthGuard)
export class CredentialsController {
    constructor(private credentialsService: CredentialsService) { }

    @Post()
    create(@Body() dto: CreateCredentialDto, @Req() req: Request) {
        const user = req.user as { id: string };
        return this.credentialsService.create(user.id, dto);
    }

    @Get()
    findAll(@Req() req: Request) {
        const user = req.user as { id: string };
        return this.credentialsService.findAll(user.id);
    }

    @Get(':id')
    findOne(@Param('id') id: string, @Req() req: Request) {
        const user = req.user as { id: string };
        return this.credentialsService.findOne(user.id, id);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() dto: UpdateCredentialDto, @Req() req: Request) {
        const user = req.user as { id: string };
        return this.credentialsService.update(user.id, id, dto);
    }

    @Delete(':id')
    delete(@Param('id') id: string, @Req() req: Request) {
        const user = req.user as { id: string };
        return this.credentialsService.delete(user.id, id);
    }

    @Get('type/:type')
    findByType(@Param('type') type: string, @Req() req: Request) {
        const user = req.user as { id: string };
        return this.credentialsService.findByType(user.id, type);
    }
}
