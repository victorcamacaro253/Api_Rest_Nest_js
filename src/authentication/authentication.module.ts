import { Module } from '@nestjs/common';
import { AuthenticationService } from '../authentication/authentication.service';
import { AuthController } from '../authentication/authentication.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from '../users/user.entity';
import { ConfigModule } from '@nestjs/config';
import { JwtUtils } from '../utils/jwt.utils';
import { LoginHistory } from '../login-history/login-history.entity';


@Module({
  imports: [TypeOrmModule.forFeature([Users,LoginHistory]), ConfigModule],
  controllers: [AuthController],
  providers: [AuthenticationService, JwtUtils],
  exports: [AuthenticationService],
})
export class AuthModule {}
