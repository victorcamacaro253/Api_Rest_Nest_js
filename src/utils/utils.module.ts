import { Module } from '@nestjs/common';
import { JwtUtils } from './jwt.utils';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [JwtUtils],
  exports: [JwtUtils],
})
export class UtilsModule {}
