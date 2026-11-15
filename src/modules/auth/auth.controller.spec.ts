import { Test } from '@nestjs/testing';
import { Response } from 'express';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

describe('AuthController', () => {
  let controller: AuthController;

  const authService = {
    register: jest.fn(),
    login: jest.fn(),
    refresh: jest.fn(),
    logout: jest.fn(),
    verifyEmail: jest.fn(),
  };
  const usersService = {
    toProfileDto: jest.fn((u: { id: string }) => ({ id: u.id })),
    getProfile: jest.fn(),
  };

  const makeRes = () =>
    ({ cookie: jest.fn(), clearCookie: jest.fn() }) as unknown as Response;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: UsersService, useValue: usersService },
      ],
    }).compile();

    controller = moduleRef.get(AuthController);
    jest.clearAllMocks();
  });

  it('registers a user and returns access token', async () => {
    const res = makeRes();
    authService.register.mockResolvedValue({
      user: { id: 'u1', email: 'a@b.com' },
      tokens: {
        accessToken: 'at',
        expiresIn: 900,
        refreshToken: 'rt',
      },
    });

    const result = await controller.register(
      {
        fullName: 'Amina Yusuf',
        email: 'amina@example.com',
        password: 'ExampleStrongPassword123!',
      },
      res,
    );

    expect(result.message).toBe('Registration successful');
    expect(result.data.accessToken).toBe('at');
    expect(authService.register).toHaveBeenCalled();
    expect(res.cookie).toHaveBeenCalled();
  });

  it('logs in and sets refresh cookie', async () => {
    const res = makeRes();
    authService.login.mockResolvedValue({
      user: { id: 'u1' },
      tokens: { accessToken: 'at', expiresIn: 900, refreshToken: 'rt' },
    });

    const result = await controller.login(
      { email: 'amina@example.com', password: 'ExampleStrongPassword123!' },
      res,
    );

    expect(result.data.accessToken).toBe('at');
    expect(res.cookie).toHaveBeenCalledWith(
      'adashi_refresh',
      'rt',
      expect.objectContaining({ httpOnly: true }),
    );
  });
});
