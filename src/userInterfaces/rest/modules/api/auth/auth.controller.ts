import { Body, Controller, Post, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RegisterDto } from '@/core/auth/application/dto/register.dto';
import { LoginDto } from '@/core/auth/application/dto/login.dto';
import { RegisterUserHandler } from '@/core/auth/application/command/register-user.handler';
import { LoginUserHandler } from '@/core/auth/application/command/login-user.handler';
import { RegisterUserCommand } from '@/core/auth/application/command/register-user.command';
import {LoginUserCommand} from "@/core/auth/application/command/ login-user.command";
import {JwtAuthGuard} from "@/userInterfaces/rest/components/guards/jwt-auth.guard";
import {CurrentUser} from "@/userInterfaces/rest/components/decorators/current-user.decorator";

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(
        private readonly registerHandler: RegisterUserHandler,
        private readonly loginHandler: LoginUserHandler,
    ) {}

    @Post('register')
    register(@Body() dto: RegisterDto) {
        return this.registerHandler.execute(new RegisterUserCommand(dto.email, dto.password));
    }

    @Post('login')
    login(@Body() dto: LoginDto) {
        return this.loginHandler.execute(new LoginUserCommand(dto.email, dto.password));
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get('me')
    me(@CurrentUser() user: any) {
        return user;
    }
}