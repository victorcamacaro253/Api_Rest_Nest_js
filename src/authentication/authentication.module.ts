import { Module } from '@nestjs/common';
import { AuthenticationService } from '../authentication/authentication.service';
import { AuthController } from '../authentication/authentication.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from '../users/user.entity';
import { ConfigModule } from '@nestjs/config';
import { JwtUtils } from '../utils/jwt.utils';
import { LoginHistory } from '../login-history/login-history.entity';
import { RefreshToken } from './strategies/refresh-token.entity';
import { PassportModule } from '@nestjs/passport';
import { GoogleStrategy } from '../authentication/strategies/oauth.strategy';


@Module({
  imports: [TypeOrmModule.forFeature([Users,LoginHistory,RefreshToken]), ConfigModule,
  PassportModule.register({ defaultStrategy: 'google' })],
  controllers: [AuthController],
  providers: [AuthenticationService, JwtUtils,GoogleStrategy],
  exports: [AuthenticationService],
})
export class AuthModule {}
