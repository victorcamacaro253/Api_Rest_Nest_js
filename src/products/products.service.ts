import { Injectable,NotFoundException,BadRequestException  } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';
import { Stock } from 'src/stock/stock.entity';
import { Category } from 'src/category/category.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { Supplier } from 'src/supplier/supplier.entity';
import * as crypto from 'crypto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Stock)
    private stockRepository: Repository<Stock>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async create(createProductDto: CreateProductDto) {
  // Check if the category exists
  const category = await this.categoryRepository.findOne({
    where: { id: createProductDto.category_id },
  });

  if (!category) {
    throw new BadRequestException('Invalid category_id: Category does not exist.');
  }

  // Check if product already exists
  const existingProduct = await this.productRepository.findOne({
    where: { name: createProductDto.name },
  });

  if (existingProduct) {
    throw new BadRequestException('Product already exists.');
  }

  const code = crypto.randomBytes(8).toString('hex').toUpperCase();

  // Create product
  const product = this.productRepository.create({
    code,
    name: createProductDto.name,
    description: createProductDto.description,
    price: createProductDto.price,
    category: category,
    image: createProductDto.imagePath,
    status: 'active',
  });

  const savedProduct = await this.productRepository.save(product);

  // Create stock entry
  const newStock = new Stock();
  newStock.product = savedProduct;
  newStock.stock = createProductDto.stock;
  newStock.supplier = { id: createProductDto.supplier } as Supplier;
  newStock.status = 'active';

  await this.stockRepository.save(newStock);

  return savedProduct;
}

  async findAll() {
    return await this.productRepository.find({
      relations: ['category']
    });
  }

  async findOne(id: number) {
    return await this.productRepository.findOne({
      where: { product_id: id },
      relations: ['category']
    });
  }

  
  async filterProducts(filters: Partial<{ name: string; category: string; price: number }>) {
    const queryBuilder = this.productRepository.createQueryBuilder('product');

    if (filters.name) {
      queryBuilder.andWhere('product.name = :name', { name: filters.name });
    }

    if (filters.category) {
      queryBuilder.andWhere('product.category = :category', { category: filters.category });
    }

    if (filters.price) {
      queryBuilder.andWhere('product.price = :price', { price: filters.price });
    }

    const products = await queryBuilder.getMany();

    if (products.length === 0) {
      throw new NotFoundException('No products found with these filters');
    }

    return products;
  }

  
  async getProductsByPriceRange(minPrice: number, maxPrice: number): Promise<Product[]> {
    return this.productRepository
      .createQueryBuilder('product')
      .where('product.price >= :minPrice', { minPrice })
      .andWhere('product.price <= :maxPrice', { maxPrice })
      .getMany();
  }


  
  async getPaginatedProducts(page: number, limit: number) {
    const offset = (page - 1) * limit;
    
    const [products, total] = await this.productRepository
      .createQueryBuilder('product')
      .skip(offset)
      .take(limit)
      .getManyAndCount();

    return {
      data: products,
      total,
      page,
      limit
    };
  }

  async update(id: number, updateProductDto: CreateProductDto) {
    return await this.productRepository.update(id, updateProductDto);
  }

  async remove(id: number) {
    return await this.productRepository.delete(id);
  }
}
