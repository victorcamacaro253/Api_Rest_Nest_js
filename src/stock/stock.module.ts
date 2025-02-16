import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StockController } from './stock.controller';
import { StockService } from './stock.service';
import { Stock } from './stock.entity';
import { UtilsModule } from '../utils/utils.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Stock]),
    UtilsModule
  ],
  controllers: [StockController],
  providers: [StockService],
  exports: [StockService],
})
export class StockModule {}
