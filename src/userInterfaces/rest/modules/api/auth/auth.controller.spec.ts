import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { CommandBus } from '@nestjs/cqrs';
import { RegisterUserCommand } from '@/core/identity/application/command/register-user.command';
import { LoginUserCommand } from '@/core/identity/application/command/login-user.command';

describe('AuthController (unit)', () => {
  let controller: AuthController;
  let bus: jest.Mocked<CommandBus>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: CommandBus,
          useValue: { execute: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    bus = module.get(CommandBus);
  });

  afterEach(() => jest.clearAllMocks());

  it('register() should dispatch RegisterUserCommand and return its result', async () => {
    const dto = {
      email: 'a@b.com',
      password: 'P@ssw0rd',
      fullName: 'AFSHINM',
      role: 'GUEST' as const,
    };
    const mockResult = { id: 'uuid-1', email: dto.email };
    bus.execute.mockResolvedValueOnce(mockResult);

    const res = await controller.register(dto as any);

    expect(bus.execute).toHaveBeenCalledTimes(1);
    const calledCmd = bus.execute.mock.calls[0][0] as RegisterUserCommand;
    expect(calledCmd).toBeInstanceOf(RegisterUserCommand);
    expect((calledCmd as any).email).toBe(dto.email);
    expect(res).toEqual(mockResult);
  });

  it('login() should dispatch LoginUserCommand and return token payload', async () => {
    const dto = { email: 'a@b.com', password: 'Secret123!' };
    const mockResult = {
      accessToken: 'jwt...',
      refreshToken: 'rjwt...',
      user: { id: 'u1', email: dto.email },
    };
    bus.execute.mockResolvedValueOnce(mockResult);

    const res = await controller.login(dto as any);

    expect(bus.execute).toHaveBeenCalledTimes(1);
    const calledCmd = bus.execute.mock.calls[0][0] as LoginUserCommand;
    expect(calledCmd).toBeInstanceOf(LoginUserCommand);
    expect((calledCmd as any).dto.email).toBe(dto.email);
    expect(res).toEqual(mockResult);
  });

  it('login() should bubble up errors from bus.execute', async () => {
    const dto = { email: 'a@b.com', password: 'bad' };
    const err = Object.assign(new Error('Invalid credentials'), {
      status: 401,
    });
    bus.execute.mockRejectedValueOnce(err);

    await expect(controller.login(dto as any)).rejects.toBe(err);
  });
});
