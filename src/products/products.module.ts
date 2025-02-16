import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { Product } from './product.entity';
import { JwtUtils } from '../utils/jwt.utils';
import { Stock } from '../stock/stock.entity';
import { Category } from '../category/category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product, Stock, Category])],
  controllers: [ProductsController],
  providers: [ProductsService, JwtUtils],
  exports: [ProductsService]
})
export class ProductsModule {}
