import { CommandBus } from '@nestjs/cqrs';
import { ApiBadRequestResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Body, Controller, Post } from '@nestjs/common';
import { RegisterUserCommand } from '@/core/identity/application/command/register-user.command';
import { RegisterDto } from '@/core/identity/application/dto/register.dto';
import { LoginUserCommand } from '@/core/identity/application/command/login-user.command';
import { LoginDto } from '@/core/identity/application/dto/login.dto';
import { Public } from '@/userInterfaces/rest/components/decorators/public.decorator';

@ApiTags('Auth')
@Controller('auth')
@Public()
export class AuthController {
  constructor(private bus: CommandBus) {}

  @Post('register')
  @ApiOperation({ summary: 'sign up' })
  @ApiBadRequestResponse({ description: 'ایمیل تکراری یا ورودی نامعتبر' })
  register(@Body() dto: RegisterDto) {
    return this.bus.execute(
      new RegisterUserCommand(dto.email, dto.password, dto.fullName, dto.role),
    );
  }

  @Post('login')
  @ApiOperation({ summary: 'sign in' })
  @ApiBadRequestResponse({ description: 'اعتبارسنجی یا نام کاربری/رمز اشتباه' })
  login(@Body() dto: LoginDto) {
    return this.bus.execute(new LoginUserCommand(dto));
  }
}
