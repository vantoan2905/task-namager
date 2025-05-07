

import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RegisterDto } from '../dto/user/register.dto';
import { LoginDto } from '../dto/user/login.dto';
import { User } from '../models/user.model';
import { hashPassword, comparePassword } from 'src/utils/hash.util';
import { genToken } from 'src/utils/gentoken.util';
import * as dotenv from 'dotenv';
import sendTokenByEmail from 'src/utils/send-mail.util';
import { VerificationCode } from 'src/models/verification-code.model';
import { Session } from 'src/models/session.model';
import { JwtService } from '@nestjs/jwt';
import { RefreshTokenDto } from 'src/dto/user/refresh-token.dto';
import { InternalServerErrorException } from '@nestjs/common';
dotenv.config();

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(VerificationCode)
    private readonly verificationCodeRepository: Repository<VerificationCode>,
    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,
    private jwtService: JwtService,
  ) {}

  async getUserById(userId: number): Promise<User> {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userRepository.findOneBy({ email });
    if (!user) return null;

    const isPasswordMatch = await comparePassword(password, user.password);
    return isPasswordMatch ? user : null;
  }

  async register(registerDto: RegisterDto): Promise<{ username: string }> {
    const { username, email, password } = registerDto;
    if (!username || !email || !password) {
      throw new Error('Missing required fields');
    }

    const existingByEmail = await this.userRepository.findOneBy({ email });
    if (existingByEmail) throw new Error('Email already in use');

    const existingByUsername = await this.userRepository.findOneBy({ username });
    if (existingByUsername) throw new Error('Username already in use');

    const hashedPassword = await hashPassword(password);
    const user = this.userRepository.create({ username, email, password: hashedPassword });
    await this.userRepository.save(user);

    return { username: user.username };
  }

  async login(user: any): Promise<{ access_token: string; refresh_token: string }> {
    if (!user?.id || !user?.email) {
      throw new UnauthorizedException('Invalid user input');
    }

    const payload = { sub: user.id, username: user.email };
    const access_token = await this.jwtService.signAsync(payload, { expiresIn: '1h' });
    const refresh_token = await this.jwtService.signAsync(payload, { expiresIn: '7d' });
    const _user = await this.userRepository.findOneBy({ id: user.id });
    await this.sessionRepository.save({
      user: { id: user.id },
      access_token,
      access_expires_at: new Date(Date.now() + 60 * 60 * 1000),
      refresh_token,
      refresh_expires_at: new Date(Date.now() + 60 * 60 * 24 * 7 * 1000),
      expires_at: new Date(Date.now() + 60 * 60 * 24 * 7 * 1000),
      revoked: false,
    });
    
    if (!_user) {
      throw new Error('User not found');
    }
    const username = _user.username; 

    const token_response = {
      access_token,
      refresh_token,
      username
    };

    return token_response;
  }

  async refreshToken(req: any, refreshTokenDto: RefreshTokenDto): Promise<{ token: string }> {
    if (!refreshTokenDto?.refreshToken) {
      throw new UnauthorizedException('Refresh token is required');
    }
    const session = await this.sessionRepository.findOne({ where: { refresh_token: refreshTokenDto.refreshToken } });
    if (!session) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    // update revoked field to true
    session.revoked = true;
    await this.sessionRepository.update({ refresh_token: refreshTokenDto.refreshToken }, { revoked: true });
    const status_response = {
      message: 'Logout successfully',
    };
    return { token: 'newtoken' };
  }

  async forgotPassword(email: string) {
    try {
      const user = await this.userRepository.findOneBy({ email });
      if (!user) {
        throw new NotFoundException('User not found');
      }
  
      const existingCode = await this.verificationCodeRepository.findOneBy({
        user: { id: user.id },
      });
  
      if (existingCode) {
        await this.verificationCodeRepository.remove(existingCode);
      }
  
      const otp = [...Array(6)].map(() => Math.floor(Math.random() * 10)).join('');
  
      let channel = '';
      let message = '';
      try {
        await sendTokenByEmail(email, otp);
        channel = 'email';
        message = 'OTP sent to email';
      } catch (err) {
        console.error('Failed to send email:', err); 
        throw new InternalServerErrorException('Failed to send email');
      }
  
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
  
      await this.verificationCodeRepository.save({
        user: { id: user.id }, 
        otp,
        channel,
        message,
        createdAt: new Date(),
        expires_at: expiresAt,
        revoked: false,
      });
  
      return { message: 'OTP sent to email', expires_at: expiresAt };
  
    } catch (error) {
      console.error('ForgotPassword error:', error); // DEBUG
      throw error; 
    }
  }
  
  
  async verifyOtp(email: string, otp: string, new_password: string) {
    const user = await this.userRepository.findOneBy({ email });
    if (!user) {
      throw new NotFoundException('User not found');
    }
  
    const code = await this.verificationCodeRepository.findOneBy({ user: { id: user.id } });
    if (!code || code.revoked || code.otp !== otp) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }
  
    if (code.expires_at < new Date()) {
      throw new UnauthorizedException('OTP has expired');
    }
  
    user.password = await hashPassword(new_password);
    await this.userRepository.save(user);
  
    code.revoked = true;
    await this.verificationCodeRepository.save(code);
  
    return { message: 'Password reset successfully' };
  }


  async logout(refreshTokenDto: RefreshTokenDto) {
    if (!refreshTokenDto?.refreshToken) {
      throw new UnauthorizedException('Refresh token is required');
    }
    const session = await this.sessionRepository.findOne({ where: { refresh_token: refreshTokenDto.refreshToken } });
    if (!session) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    // update revoked field to true
    session.revoked = true;
    await this.sessionRepository.update({ refresh_token: refreshTokenDto.refreshToken }, { revoked: true });
    const status_response = {
      message: 'Logged out',
    };
    return status_response;
  }
}

