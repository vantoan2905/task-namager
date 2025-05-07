import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { User } from '../models/user.model';
import { VerificationCode } from '../models/verification-code.model';
import { Session } from '../models/session.model';
import { RegisterDto } from '../dto/user/register.dto';
import { RefreshTokenDto } from '../dto/user/refresh-token.dto';
import { hashPassword, comparePassword } from '../utils/hash.util';
import sendTokenByEmail from '../utils/send-mail.util';
import * as fs from 'fs';
import * as path from 'path';

jest.mock('../utils/hash.util', () => ({
  hashPassword: jest.fn().mockResolvedValue('hashed-pw'),
  comparePassword: jest.fn().mockResolvedValue(true),
}));

jest.mock('../utils/send-mail.util', () => ({
  __esModule: true,
  default: jest.fn().mockResolvedValue(undefined),
}));

describe('UserService', () => {
  let service: UserService;
  let mockUserRepo: jest.Mocked<Repository<User>>;
  let mockVerificationRepo: jest.Mocked<Repository<VerificationCode>>;
  let mockSessionRepo: jest.Mocked<Repository<Session>>;
  let jwtService: JwtService;


  const testLogs: Array<{ name: string; input: any; output: any }> = [];

  beforeEach(async () => {
    mockUserRepo = {
      findOneBy: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
    } as any;

    mockVerificationRepo = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
    } as any;

    mockSessionRepo = {
      save: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: getRepositoryToken(User), useValue: mockUserRepo },
        { provide: getRepositoryToken(VerificationCode), useValue: mockVerificationRepo },
        { provide: getRepositoryToken(Session), useValue: mockSessionRepo },
        { provide: JwtService, useValue: { signAsync: jest.fn().mockResolvedValue('mocked-token') } },
      ],
    }).compile();

    service = module.get(UserService);
    jwtService = module.get(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    // Ghi toàn bộ testLogs ra file JSON
    const outputPath = path.join(__dirname, 'test-results-log.json');
    fs.writeFileSync(outputPath, JSON.stringify(testLogs, null, 2), 'utf-8');
  });

  describe('register', () => {
    it('should fail if input is missing', async () => {
      const dto: RegisterDto = { username: '', email: '', password: '' };
      const res = await service.register(dto);

      testLogs.push({ name: 'register_missing', input: dto, output: res });

      expect(res.success).toBe(false);
      expect(res.message).toBe('Input cannot be null');
    });

    it('should fail if user already exists (by email)', async () => {
      const dto: RegisterDto = { username: 'u', email: 'e@mail.com', password: 'p' };
      mockUserRepo.findOneBy.mockResolvedValueOnce({ id: 1 } as any);
      const res = await service.register(dto);

      testLogs.push({ name: 'register_existing_email', input: dto, output: res });

      expect(res.success).toBe(false);
      expect(res.message).toBe('User already exists');
    });

    it('should fail if user already exists (by username)', async () => {
      const dto: RegisterDto = { username: 'u', email: 'e@mail.com', password: 'p' };
      mockUserRepo.findOneBy
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ id: 2 } as any);
      const res = await service.register(dto);

      testLogs.push({ name: 'register_existing_username', input: dto, output: res });

      expect(res.success).toBe(false);
      expect(res.message).toBe('User already exists');
    });

    it('should register successfully with valid input', async () => {
      const dto: RegisterDto = { username: 'new', email: 'new@mail.com', password: 'pass123' };
      mockUserRepo.findOneBy.mockResolvedValue(null);
      mockUserRepo.create.mockImplementation(data => data as any);
      mockUserRepo.save.mockResolvedValue({ id: 99, ...dto } as any);

      const res = await service.register(dto);

      testLogs.push({ name: 'register_success', input: dto, output: res });

      expect(hashPassword).toHaveBeenCalledWith(dto.password);
      expect(res.success).toBe(true);
      expect(res.data.username).toBe(dto.username);
    });
  });

  describe('validateUser', () => {
    it('should return null if user not found', async () => {
      (mockUserRepo.findOneBy as any).mockResolvedValue(null);
      const input = { email: 'x@mail.com', password: 'pw' };
      const result = await service.validateUser(input.email, input.password);

      testLogs.push({ name: 'validateUser_not_found', input, output: result });

      expect(result).toBeNull();
    });

    it('should return null if password mismatch', async () => {
      (mockUserRepo.findOneBy as any).mockResolvedValue({ password: 'wrong' } as any);
      (comparePassword as jest.Mock).mockResolvedValue(false);
      const input = { email: 'x@mail.com', password: 'pw' };
      const result = await service.validateUser(input.email, input.password);

      testLogs.push({ name: 'validateUser_mismatch', input, output: result });

      expect(result).toBeNull();
    });

    it('should return user if credentials match', async () => {
      const user = { id: 1, email: 'ok@mail.com', password: 'hashed' } as any;
      (mockUserRepo.findOneBy as any).mockResolvedValue(user);
      (comparePassword as jest.Mock).mockResolvedValue(true);
      const input = { email: user.email, password: 'pw' };
      const result = await service.validateUser(input.email, input.password);

      testLogs.push({ name: 'validateUser_success', input, output: result });

      expect(result).toEqual(user);
    });
  });

  describe('login', () => {
    it('should error if invalid input', async () => {
      const input = { id: null, email: null } as any;
      const res = await service.login(input);

      testLogs.push({ name: 'login_invalid_input', input, output: res });

      expect(res.success).toBe(false);
    });

    it('should login and save session', async () => {
      const input = { id: 5, email: 'a@mail.com' } as any;
      const res = await service.login(input);

      testLogs.push({ name: 'login_success', input, output: res });

      expect(jwtService.signAsync).toHaveBeenCalledTimes(2);
      expect(mockSessionRepo.save).toHaveBeenCalled();
      expect(res.success).toBe(true);
    });
  });

  describe('forgotPassword', () => {
    it('should fail if email missing', async () => {
      const input = '';
      const res = await service.forgotPassword(input);

      testLogs.push({ name: 'forgotPassword_missing_email', input, output: res });

      expect(res.success).toBe(false);
    });

    it('should fail if user not found', async () => {
      (mockUserRepo.findOne as any).mockResolvedValue(null);
      const input = 'no@mail.com';
      const res = await service.forgotPassword(input);

      testLogs.push({ name: 'forgotPassword_user_not_found', input, output: res });

      expect(res.success).toBe(false);
    });

    it('should send OTP successfully', async () => {
      const input = 'ok@mail.com';
      (mockUserRepo.findOne as any).mockResolvedValue({ id: 7, email: input } as any);
      mockVerificationRepo.create.mockReturnValue({} as any);
      mockVerificationRepo.save.mockResolvedValue({} as any);

      const res = await service.forgotPassword(input);

      testLogs.push({ name: 'forgotPassword_success', input, output: res });

      expect(sendTokenByEmail).toHaveBeenCalledWith(input, expect.any(String));
      expect(mockVerificationRepo.save).toHaveBeenCalled();
      expect(res.success).toBe(true);
    });
  });
});
