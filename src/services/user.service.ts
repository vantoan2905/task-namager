import { Injectable, Res } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
// import { UserRepository } from '../repositories/user.repository';
import { RegisterDto } from '../dto/user/register.dto';
import { LoginDto } from '../dto/user/login.dto';
import { User } from '../models/user.model'; 
import { hashPassword , comparePassword} from 'src/utils/hash.util';
import { compare } from 'bcrypt';
import { genToken } from 'src/utils/gentoken.util';
import jwt from 'jsonwebtoken';
import { ResponseDto } from 'src/dto/user/response.dto';
// dotenv
import * as dotenv from 'dotenv';
import sendTokenByEmail from 'src/utils/send-mail.util';
import { VerificationCode } from 'src/models/verification-code.model';
import { Session } from 'src/models/session.model';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RefreshTokenDto } from 'src/dto/user/refresh-token.dto';
dotenv.config();



@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    // private readonly userRepository: UserRepository,
    private readonly userRepository: Repository<User>,
    @InjectRepository(VerificationCode)
    private readonly verificationCodeRepository: Repository<VerificationCode>,
    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,
    private jwtService: JwtService

  ) {}
  async getUserById(userId: number): Promise<User> {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }
  // ---------------------------------------------------------------------------------------------
  // Validate user credentials
  // ---------------------------------------------------------------------------------------------
  /**
   * Validate user credentials
   * @param email the email of the user to validate
   * @param password the password of the user to validate
   * @returns the user if the credentials are valid, null otherwise
   */
  async validateUser(email: string, password: string): Promise<User | null> {
    // console.log(email,password )
    const user = await this.userRepository.findOneBy({ email });
    if (!user) {
      return null;
    }
    // console.log(user)
    const isPasswordMatch = await comparePassword(password, user.password);
    if (!isPasswordMatch) {
      return null;
    }
    // console.log('User validated successfully');
    return user;
  }
  // ----------------------------------------------------------------------------------------------
  // Register a new user
  // ----------------------------------------------------------------------------------------------
  /**
   * Registers a new user
   * @param registerDto the user registration data
   * @returns a response with the username of the registered user
   * @throws {Error} if the user already exists
   */
  async register(registerDto: RegisterDto): Promise<ResponseDto<{ username: string }>> {
    const { username, email, password } = registerDto;

    let message = '';

    if (!username || !email || !password) {
      message = 'Input cannot be null';
      return ResponseDto.errorResponse(message, []);
    }

    message = 'User registered successfully';
    let existingUser = await this.userRepository.findOneBy({ email });
    if (existingUser) {
      message = 'User already exists';
      return ResponseDto.errorResponse(message, [username]);
    }
    existingUser = await this.userRepository.findOneBy({ username });
    if (existingUser) {
      message = 'User already exists';
      return ResponseDto.errorResponse(message, [username]);
    }
    const hashedPassword = await hashPassword(password);
    const user = this.userRepository.create({
      username,
      email,
      password: hashedPassword,
    });
    if (!user) {
      throw new Error('Failed to create user');
    }
    await this.userRepository.save(user);
    const response = {
      username: user.username
    };
    return ResponseDto.successResponse(response,message);
  }
  // --------------------------------------------------------------------------------------------------------------
  // login
  // --------------------------------------------------------------------------------------------------------------

  /**
   * Login a user and return an access token and a refresh token.
   * The access token is valid for 1 hour and the refresh token is valid for 7 days.
   * @param user The user object with the id and email.
   * @returns A ResponseDto object with the access token and refresh token.
   * @example
   * const user = { id: 1, email: 'test@example.com' };
   * const response = await this.userService.login(user);
   * console.log(response);
   */
  async login(user:any): Promise<ResponseDto<{ access_token: string; refresh_token: string }>> {

    const payload = {sub : user.id, username: user.email};
    if (!user || !user.id || !user.email) {
      return ResponseDto.errorResponse('Invalid user input', []);
    }
    const access_token = await this.jwtService.signAsync(payload, {expiresIn: '1h'});
    const refresh_token = await this.jwtService.signAsync(payload, {expiresIn: '7d'});
  
    await this.sessionRepository.save({
      user: { id: user.id },
      access_token,
      access_expires_at: new Date(Date.now() + 60 * 60 * 1000),
      refresh_token,
      refresh_expires_at: new Date(Date.now() + 60 * 60 * 24 * 7 * 1000),
      expires_at: new Date(Date.now() + 60 * 60 * 24 * 7 * 1000),
      revoked: false
    });
  
    const token_response = {
      access_token,
      refresh_token
    };
  
    return ResponseDto.successResponse(token_response, 'Login successful');
  }
  
  // --------------------------------------------------------------------------------------------------------------
  // forgot password
  // --------------------------------------------------------------------------------------------------------------
  
  /**
   * Sends a password reset token to the user's email
   * @param email the email of the user to send the token to
   * @returns a response with the message and expires at date
   * @throws {Error} if the user is not found
   */
  async forgotPassword(email: string): Promise<ResponseDto<{ message: string; expires_at: Date }>> {
    if (!email) {
      return ResponseDto.errorResponse('Email is required', []);
    }
    const user = await this.userRepository.findOne({ where: { email } });
  
    if (!user) {
      const message = 'User not found';
      return ResponseDto.errorResponse(message, [email]);
    }

    const length = 6;  
    const token = [...Array(length)].map(() => Math.floor(Math.random() * 10)).join('');

    await sendTokenByEmail(email, token);

    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); 

    const verificationCode = this.verificationCodeRepository.create({
      user: { id: user.id },
      channel: 'email',
      otp: token,
      message: 'OTP sent to email',
      createdAt: new Date(),
      expires_at: expiresAt,
      revoked: false,
    });

    await this.verificationCodeRepository.save(verificationCode);

    const status_response = {
      data: {
        email: email
      },
      message: 'OTP sent to email , forget password, expires in 1 hours',
      expires_at: expiresAt,
    };
    return ResponseDto.successResponse(status_response, 'OTP sent to email');
  }
  // --------------------------------------------------------------------------------------------------------------
  // Verify OTP
  // --------------------------------------------------------------------------------------------------------------
  /**
   * Verifies the OTP for a user and resets their password if valid
   * @param email the email of the user to verify
   * @param otp the OTP to verify
   * @param new_password the new password to set for the user
   * @returns a response with the message
   * @throws {NotFoundException} if the user is not found
   * @throws {UnauthorizedException} if the OTP is invalid or expired
   */
  async verifyOtp(email: string, otp: string, new_password: string): Promise<ResponseDto<{ message: string }>> {
    if (!email || !otp || !new_password) {
      return ResponseDto.errorResponse('Email, OTP, and new password are required', []);
    }
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const verificationCode = await this.verificationCodeRepository.findOne({ where: { user: { id: user.id }, otp } });
    if (!verificationCode || verificationCode.revoked) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }
    if (verificationCode.expires_at < new Date()) {
      throw new UnauthorizedException('OTP has expired');
    }
    user.password = await hashPassword(new_password);
    await this.userRepository.save(user);
    verificationCode.revoked = true;
    await this.verificationCodeRepository.save(verificationCode);
    return ResponseDto.successResponse({ message: 'Password reset successfully' }, 'Password reset successfully');

  };
  // --------------------------------------------------------------------------------------------------------------
  // refresh token
  // --------------------------------------------------------------------------------------------------------------
  async refreshToken(user : any, refreshTokenDto: RefreshTokenDto): Promise<ResponseDto<{ token: string }>> {
    if (!refreshTokenDto || !refreshTokenDto.refreshToken || !user?.id || !user?.email) {
      return ResponseDto.errorResponse('Invalid input', []);
    }

    const session = await this.sessionRepository.findOne({ where: { refresh_token: refreshTokenDto.refreshToken } });
    if (!session) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    const payload = {sub : user.id, username: user.email};
    const token = await this.jwtService.signAsync(payload, {expiresIn: '1h'});
    const data = {
      token: token,
    };
    const access_expires_at = new Date(Date.now() + 60 * 60 * 1000);
    await this.sessionRepository.update(
      { refresh_token: refreshTokenDto.refreshToken },
      { access_token: token, access_expires_at: access_expires_at }
    );
    return ResponseDto.successResponse(data, 'Token refreshed successfully');
  };



  // --------------------------------------------------------------------------------------------------------------
  // logout
  // --------------------------------------------------------------------------------------------------------------
  async logout(refreshTokenDto: any): Promise<ResponseDto<{ message: string }>> {
    if (!refreshTokenDto?.refresh_token) {
      return ResponseDto.errorResponse('Refresh token is required', []);
    }
    const session = await this.sessionRepository.findOne({ where: { refresh_token: refreshTokenDto.refresh_token } });
    if (!session) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    // update revoked field to true
    session.revoked = true;
    await this.sessionRepository.update({ refresh_token: refreshTokenDto.refresh_token }, { revoked: true });
    const status_response = {
      message: 'Logout successfully',
    };
    return ResponseDto.successResponse(status_response, 'Logout successfully');
  }

}