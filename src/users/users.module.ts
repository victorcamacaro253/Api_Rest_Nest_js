import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './users.controller';
import { UserService } from './users.service';
import { Users } from './user.entity';
import { JwtUtils } from '../utils/jwt.utils';
import { ConfigModule } from '@nestjs/config';
import { Roles } from '../roles/role.entity';


@Module({
  imports: [
    TypeOrmModule.forFeature([Users,Roles]),
    ConfigModule
  ],
  controllers: [UserController],
  providers: [UserService, JwtUtils],
  exports: [UserService]
})
export class UsersModule {}
