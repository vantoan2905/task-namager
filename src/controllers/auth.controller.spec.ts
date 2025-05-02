import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { UserService } from '../services/user.service';
import { HttpException, HttpStatus } from '@nestjs/common';
import { RegisterDto } from 'src/dto/user/register.dto';
import { ForgotPasswordDto } from 'src/dto/user/forgot-password.dto';
import { LoginDto } from 'src/dto/user/login.dto';
import { RefreshTokenDto } from 'src/dto/user/refresh-token.dto';
import { VerifyOtpDto } from 'src/dto/user/verify-otp.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let userService: jest.Mocked<UserService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: UserService,
          useValue: {
            register: jest.fn(),
            login: jest.fn(),
            forgotPassword: jest.fn(),
            verifyOtp: jest.fn(),
            refreshToken: jest.fn(),
            logout: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    userService = module.get<UserService>(UserService) as jest.Mocked<UserService>;
  });

  it('should register a user successfully', async () => {
    const dto: RegisterDto = { email: 'test@example.com', password: 'password123' };
    const result = { id: 1, email: 'test@example.com' };
    userService.register.mockResolvedValue(result);

    const response = await controller.register(dto);

    expect(response).toEqual(result);
    expect(userService.register).toHaveBeenCalledWith(dto);
  });

  it('should throw an error if required fields are missing during registration', async () => {
    const dto: RegisterDto = { email: '', password: '' };
    userService.register.mockRejectedValue(new HttpException('Validation failed', HttpStatus.BAD_REQUEST));

    await expect(controller.register(dto)).rejects.toThrow(HttpException);
    expect(userService.register).toHaveBeenCalledWith(dto);
  });

  it('should login a user successfully', async () => {
    const req = { user: { id: 1, email: 'test@example.com' } };
    const result = { accessToken: 'token', refreshToken: 'refreshToken' };
    userService.login.mockResolvedValue(result);

    const response = await controller.login(req as any);

    expect(response).toEqual(result);
    expect(userService.login).toHaveBeenCalledWith(req.user);
  });

  it('should throw an error if data type is incorrect during login', async () => {
    const req = { user: { id: 'invalid_id', email: 'test@example.com' } };
    userService.login.mockRejectedValue(new HttpException('Invalid data type', HttpStatus.BAD_REQUEST));

    await expect(controller.login(req as any)).rejects.toThrow(HttpException);
    expect(userService.login).toHaveBeenCalledWith(req.user);
  });

  it('should throw an error if token is invalid during refresh token', async () => {
    const dto: RefreshTokenDto = { refresh_token: 'invalid.token' };
    const req = { user: { id: 1 } };
    userService.refreshToken.mockRejectedValue(new HttpException('Invalid token', HttpStatus.UNAUTHORIZED));

    await expect(controller.refreshToken(req as any, dto)).rejects.toThrow(HttpException);
    expect(userService.refreshToken).toHaveBeenCalledWith(req, dto);
  });

  it('should throw an error if OTP verification fails', async () => {
    const dto: VerifyOtpDto = { email: 'test@example.com', otp: 'wrong_otp', new_password: 'newpassword' };
    userService.verifyOtp.mockRejectedValue(new HttpException('Invalid OTP', HttpStatus.BAD_REQUEST));

    await expect(controller.verifyOtp(dto)).rejects.toThrow(HttpException);
    expect(userService.verifyOtp).toHaveBeenCalledWith(dto.email, dto.otp, dto.new_password);
  });

  it('should throw an error if trying to logout with an invalid token', async () => {
    const dto = { refresh_token: 'invalid.token' };
    userService.logout.mockRejectedValue(new HttpException('Invalid token', HttpStatus.UNAUTHORIZED));

    await expect(controller.logout(dto)).rejects.toThrow(HttpException);
    expect(userService.logout).toHaveBeenCalledWith(dto);
  });
});
