import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../models/user.model';
import { VerificationCode } from '../models/verification-code.model';
import { Session } from '../models/session.model';
import { AuthController } from '../controllers/auth.controller';
import { UserService } from '../services/user.service';
// import { LocalStrategy } from 'src/middlewares/local.strategy';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from 'src/middlewares/local.strategy';
import { JwtStrategy } from 'src/middlewares/jwt.strategy';
// import { LocalAuthGuard } from 'src/middlewares/local-auth.guard';
@Module({
  imports: [
    TypeOrmModule.forFeature([User, VerificationCode, Session]),
    JwtModule.registerAsync({
      useFactory: async (configService: ConfigService) => ({
        global : true,
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_ACCESS_TOKEN_EXPIRED'),
        },
      }),
      inject: [ConfigService],
    }),
    PassportModule,
  ],
  controllers: [AuthController],
  providers: [UserService, LocalStrategy, JwtStrategy],
  exports: [UserService],
})
export class AuthModule {}
