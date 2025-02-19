import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PurchasesService } from './purchases.service';
import { PurchasesController } from './purchases.controller';
import { Purchase } from './entities/purchase.entity';
import { PurchasedProduct } from './entities/purchased-product.entity';
import { Product } from 'src/products/product.entity';
import { UtilsModule } from '../utils/utils.module';
import { ExportModule } from 'src/export/export.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Purchase, PurchasedProduct,Product]),
    ExportModule,
    UtilsModule
  ],
  controllers: [PurchasesController],
  providers: [PurchasesService],
  exports: [PurchasesService],
})
export class PurchasesModule {}
