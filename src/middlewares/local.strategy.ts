import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
// import { ExtractJwt } from 'passport-jwt';
import { UserService } from 'src/services/user.service';
// import { UnauthorizedException } from '@nestjs/common';
import { ResponseDto } from 'src/dto/user/response.dto';
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: UserService) {
    super({
      usernameField: 'email',
      passwordField: 'password',
    });
  }

  async validate(email: string, password: string): Promise<any> {
    const user = await this.authService.validateUser(email, password);
    if (!user) {
      // throw new UnauthorizedException('Invalid credentials');
      ResponseDto.errorResponse('user is not exist ', ['Invalid credentials']);
    }
    return user;
  }
}
