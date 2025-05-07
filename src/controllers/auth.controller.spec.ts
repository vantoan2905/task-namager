import { AuthController } from '../controllers/auth.controller';
import { UserService } from '../services/user.service';
import { RegisterDto } from '../dto/user/register.dto';
import { LoginDto } from '../dto/user/login.dto';
import { ForgotPasswordDto } from '../dto/user/forgot-password.dto';
import { VerifyOtpDto } from '../dto/user/verify-otp.dto';
import { RefreshTokenDto } from '../dto/user/refresh-token.dto';
import * as fs from 'fs';

declare const jest: any;

type OutputData = { api: string; input: any; result?: any; status: string };
const outputsDir = './__tests__/outputs';
const aggregateFile = `${outputsDir}/auth_aggregate_results.json`;
if (!fs.existsSync(outputsDir)) fs.mkdirSync(outputsDir, { recursive: true });
let aggregateResults: OutputData[] = [];
function collectOutput(data: OutputData) { aggregateResults.push(data); }
afterAll(() => { fs.writeFileSync(aggregateFile, JSON.stringify(aggregateResults, null, 2)); });

// Mock UserService
const mockUserService = () => ({
  register: jest.fn(),
  login: jest.fn(),
  forgotPassword: jest.fn(),
  verifyOtp: jest.fn(),
  refreshToken: jest.fn(),
  logout: jest.fn(),
});

describe('AuthController', () => {
  let controller: AuthController;
  let userService: ReturnType<typeof mockUserService>;

  beforeEach(() => {
    userService = mockUserService();
    controller = new AuthController(userService as unknown as UserService);
    jest.clearAllMocks();
  });
// ---------------------------------------------------------------------------------------------
// register test 
// ---------------------------------------------------------------------------------------------
  describe('register', () => {
    it('good value', async () => {
      const dto: RegisterDto = { email: 'test@example.com', password: 'pass123', username: 'testuser' };
      const expected = { id: 1, ...dto };
      userService.register.mockResolvedValue(expected);

      const result = await controller.register(dto);
      collectOutput({ api: 'register', input: dto, result, status: 'good' });
      expect(result).toEqual(expected);
    });

    it('missing value', async () => {
      const dto = { email: '' } as any;
      userService.register.mockRejectedValue(new Error('Missing fields'));

      await expect(controller.register(dto)).rejects.toThrow();
      collectOutput({ api: 'register', input: dto, status: 'missing' });
    });

    it('bad value', async () => {
      const dto: RegisterDto = { email: 'bad', password: '123', username: 'baduser' };
      userService.register.mockRejectedValue(new Error('Invalid data'));

      await expect(controller.register(dto)).rejects.toThrow();
      collectOutput({ api: 'register', input: dto, status: 'bad' });
    });
  });
  // --------------------------------------------------------------------------------------------
  // login test
  // --------------------------------------------------------------------------------------------

  describe('login', () => {
    it('good value', async () => {
      const dto: LoginDto = { email: 'user@example.com', password: 'pass' };
      const req = { user: { id: 1, email: dto.email } };
      const expected = { accessToken: 'token' };
      userService.login.mockResolvedValue(expected);

      const result = await controller.login(req as any, dto);
      collectOutput({ api: 'login', input: { user: req.user }, result, status: 'good' });
      expect(result).toEqual(expected);
    });

    it('missing value', async () => {
      const req = {} as any;
      const result = await controller.login(req, {} as any);
      collectOutput({ api: 'login', input: {}, status: 'missing' });
      expect(result).toBeUndefined();
    });

    it('bad value', async () => {
      const dto: LoginDto = { email: 'user@example.com', password: 'wrong' };
      const req = { user: { id: 1 } };
      userService.login.mockRejectedValue(new Error('Unauthorized'));

      await expect(controller.login(req as any, dto)).rejects.toThrow();
      collectOutput({ api: 'login', input: { user: req.user }, status: 'bad' });
    });
  });

  // -------------------------------------------------------------------------------------------
  // forgotPassword test
  // --------------------------------------------------------------------------------------------

  describe('forgotPassword', () => {
    it('good value', async () => {
      const dto: ForgotPasswordDto = { email: 'user2@example.com' };
      const expected = { message: 'OTP sent' };
      userService.forgotPassword.mockResolvedValue(expected);

      const result = await controller.forgotPassword(dto);
      collectOutput({ api: 'forgotPassword', input: dto, result, status: 'good' });
      expect(result).toEqual(expected);
    });

    it('missing value', async () => {
      const dto = { } as any;
      userService.forgotPassword.mockRejectedValue(new Error('Missing email'));

      await expect(controller.forgotPassword(dto)).rejects.toThrow();
      collectOutput({ api: 'forgotPassword', input: dto, status: 'missing' });
    });

    it('bad value', async () => {
      const dto: ForgotPasswordDto = { email: 'invalid' };
      userService.forgotPassword.mockRejectedValue(new Error('User not found'));

      await expect(controller.forgotPassword(dto)).rejects.toThrow();
      collectOutput({ api: 'forgotPassword', input: dto, status: 'bad' });
    });
  });

  // -------------------------------------------------------------------------------------------
  // verifyOtp test
  // --------------------------------------------------------------------------------------------

  describe('verifyOtp', () => {
    it('good value', async () => {
      const dto: VerifyOtpDto = { email: 'user3@example.com', otp: '1234', new_password: 'newpass' };
      const expected = { message: 'Password reset' };
      userService.verifyOtp.mockResolvedValue(expected);

      const result = await controller.verifyOtp(dto);
      collectOutput({ api: 'verifyOtp', input: dto, result, status: 'good' });
      expect(result).toEqual(expected);
    });

    it('missing value', async () => {
      const dto = { email: 'user@example.com' } as any;
      userService.verifyOtp.mockRejectedValue(new Error('Missing fields'));

      await expect(controller.verifyOtp(dto)).rejects.toThrow();
      collectOutput({ api: 'verifyOtp', input: dto, status: 'missing' });
    });

    it('bad value', async () => {
      const dto: VerifyOtpDto = { email: 'user3@example.com', otp: '0000', new_password: 'newpass' };
      userService.verifyOtp.mockRejectedValue(new Error('Invalid OTP'));

      await expect(controller.verifyOtp(dto)).rejects.toThrow();
      collectOutput({ api: 'verifyOtp', input: dto, status: 'bad' });
    });
  });
  // -------------------------------------------------------------------------------------------
  // refreshToken test
  // --------------------------------------------------------------------------------------------

  describe('refreshToken', () => {
    it('good value', async () => {
      const dto: RefreshTokenDto = { refreshToken: 'refresh123' };
      const req = {} as any;
      const expected = { accessToken: 'newtoken' };
      userService.refreshToken.mockResolvedValue(expected);

      const result = await controller.refreshToken(req, dto);
      collectOutput({ api: 'refreshToken', input: {}, result, status: 'good' });
      expect(result).toEqual(expected);
    });

    it('missing value', async () => {
      const result = await controller.refreshToken({} as any, {} as any);
      collectOutput({ api: 'refreshToken', input: {}, status: 'missing' });
      expect(result).toBeUndefined();
    });

    it('bad value', async () => {
      const dto: RefreshTokenDto = { refreshToken: 'invalid' };
      userService.refreshToken.mockRejectedValue(new Error('Invalid token'));

      await expect(controller.refreshToken({} as any, dto)).rejects.toThrow();
      collectOutput({ api: 'refreshToken', input: {}, status: 'bad' });
    });
  });

  // -------------------------------------------------------------------------------------------
  // logout test
  // --------------------------------------------------------------------------------------------
  describe('logout', () => {
    it('good value', async () => {
      const dto = { refreshToken: 'refresh456' };
      const expected = { message: 'Logged out' };
      userService.logout.mockResolvedValue(expected);

      const result = await controller.logout(dto);
      collectOutput({ api: 'logout', input: dto, result, status: 'good' });
      expect(result).toEqual(expected);
    });

    it('missing value', async () => {
      const dto = {} as any;
      userService.logout.mockRejectedValue(new Error('Missing token'));

      await expect(controller.logout(dto)).rejects.toThrow();
      collectOutput({ api: 'logout', input: dto, status: 'missing' });
    });

    it('bad value', async () => {
      const dto = { refreshToken: 'invalid' };
      userService.logout.mockRejectedValue(new Error('Logout failed'));

      await expect(controller.logout(dto)).rejects.toThrow();
      collectOutput({ api: 'logout', input: dto, status: 'bad' });
    });
  });
});
