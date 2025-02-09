import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './users.controller';
import { UserService } from './users.service';
import { Users } from './user.entity';
import { RolesModule } from '../roles/roles.module';


@Module({
  imports: [TypeOrmModule.forFeature([Users]),
  RolesModule],
  controllers: [UserController],
  providers: [UserService],
})
export class UsersModule {}