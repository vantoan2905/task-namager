import { Controller, Post, Body, HttpException, HttpStatus, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UserService } from '../services/user.service';
import { RegisterDto } from '../dto/user/register.dto';
import { LoginDto } from '../dto/user/login.dto';
import { ForgotPasswordDto } from '../dto/user/forgot-password.dto';
import { VerifyOtpDto } from '../dto/user/verify-otp.dto';
import { ResetPasswordDto } from '../dto/user/reset-password.dto';
import { RefreshTokenDto } from '../dto/user/refresh-token.dto';
import { AuthGuard } from '@nestjs/passport';
import { LocalAuthGuard } from 'src/middlewares/local-auth.guard';
// import { JwtAuthGuard } from 'src/middlewares/jwtAuthGuard';
import { JwtAuthGuard } from 'src/middlewares/jwt-auth.guard';
import { Public } from 'src/middlewares/public-flag';

@ApiTags('Auth') 
@Controller('auth')
export class AuthController {
  constructor(private readonly UserService: UserService) {}
  // --------------------------------------------------------------------------------------------------------------
  // register
  // --------------------------------------------------------------------------------------------------------------
  @Post('register')
  // @UseGuards(JwtAuthGuard)
  @Public()
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 400, description: 'Registration failed' })
  async register(@Body() registerDto: RegisterDto) {
    const user = await this.UserService.register(registerDto);
    console.log('User registered successfully:');
    return user
  }
  // --------------------------------------------------------------------------------------------------------------
  // login
  // --------------------------------------------------------------------------------------------------------------
  @Post('login')
  @Public()
  @UseGuards(LocalAuthGuard)
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Login failed' })
  async login( @Request() req) {
    const result = await this.UserService.login(req.user);

    return result;
  }
  // --------------------------------------------------------------------------------------------------------------
  // forgot password
  // --------------------------------------------------------------------------------------------------------------

  @Post('forgot-password')
  @Public()
  @ApiOperation({ summary: 'Request forgot password' })
  @ApiResponse({ status: 200, description: 'Forgot password request received' })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    const result = await this.UserService.forgotPassword(forgotPasswordDto.email);
    return result;
  }
  // --------------------------------------------------------------------------------------------------------------
  // verify otp
  // --------------------------------------------------------------------------------------------------------------
  @Post('verify-otp')
  @Public()
  @ApiOperation({ summary: 'Verify OTP' })
  @ApiResponse({ status: 200, description: 'OTP verified successfully' })
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    const result = await this.UserService.verifyOtp(verifyOtpDto.email, verifyOtpDto.otp, verifyOtpDto.new_password);
    return result;
  }

  // --------------------------------------------------------------------------------------------------------------
  // refresh token
  // --------------------------------------------------------------------------------------------------------------
  @Post('refresh-token')
  @Public()
  @ApiOperation({ summary: 'Refresh token' })
  @ApiResponse({ status: 200, description: 'Token refreshed successfully' })
  @ApiResponse({ status: 401, description: 'Refresh token failed' })
  async refreshToken(@Request() req, @Body() refreshTokenDto: RefreshTokenDto) {
    return await this.UserService.refreshToken(req, refreshTokenDto);
  }
  // --------------------------------------------------------------------------------------------------------------
  // logout
  // --------------------------------------------------------------------------------------------------------------

  @Post('logout')
  @Public()
  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({ status: 200, description: 'Logout successful' })
  @ApiResponse({ status: 401, description: 'Logout failed' })
  async logout(@Body() logoutDto: any) {
    return await this.UserService.logout(logoutDto);
  }
}
