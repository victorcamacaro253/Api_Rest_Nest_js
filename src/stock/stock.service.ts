import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Stock } from './stock.entity';

@Injectable()
export class StockService {
  constructor(
    @InjectRepository(Stock)
    private stockRepository: Repository<Stock>,
  ) {}

  async findAll() {
    return await this.stockRepository
      .createQueryBuilder('stock')
      .leftJoinAndSelect('stock.product', 'product')
      .leftJoinAndSelect('stock.supplier', 'supplier')
      .leftJoinAndSelect('product.category', 'category')
      .select([
        'stock',
        'product',
        'supplier',
        'category.name'
      ])
      .getMany();
  }

  async findOne(id: number) {
    return await this.stockRepository.findOne({
      where: { id },
      relations: ['product', 'supplier']
    });
  }

  async findByProduct(productId: number) {
    return await this.stockRepository.find({
      where: { product: { id: productId } as any },
      relations: ['product', 'supplier']
    });
  }

  async updateStock(id: number, quantity: number) {
    const stock = await this.findOne(id);
    if (stock) {
      stock.stock = quantity;
      return await this.stockRepository.save(stock);
    }
    throw new Error('Stock not found');
  }
}
