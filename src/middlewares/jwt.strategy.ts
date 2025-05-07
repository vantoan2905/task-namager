import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  /**
   * Constructor for the JWT strategy.
   *
   * @param {ConfigService} configService - The config service to get the JWT secret.
   *
   * @remarks
   * The constructor initializes the strategy with the JWT secret from the
   * environment variable `JWT_SECRET` and the appropriate settings for
   * validation.
   */
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET')!,
    });
  }

  /**
   * Validate the payload from a JWT.
   *
   * @param {object} payload - The payload from the JWT.
   *
   * @returns {Promise<{ userId: string, username: string }>} - The validated user data.
   *
   * @remarks
   * This method is called by the PassportJS strategy. It validates the payload
   * from the JWT and returns the user data.
   */
  async validate(payload: any) {
    return { userId: payload.sub, username: payload.username };
  }
}
