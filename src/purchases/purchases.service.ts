import { Injectable, BadRequestException,NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Purchase } from './entities/purchase.entity';
import { PurchasedProduct } from './entities/purchased-product.entity'
import { Product } from '../products/product.entity';
import { CreatePurchaseDto } from './dto/create-purchase.dto';

@Injectable()
export class PurchasesService {
  constructor(
    @InjectRepository(Purchase)
    private purchaseRepository: Repository<Purchase>,
    @InjectRepository(PurchasedProduct)
    private purchasedProductRepository: Repository<PurchasedProduct>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>
  ) {}

/*  async create(createPurchaseDto: CreatePurchaseDto) {
    const totalAmount = createPurchaseDto.products.reduce(
      (sum, product) => sum + (product.price * product.quantity),
      0
    );

    const purchase = this.purchaseRepository.create({
      user_id: createPurchaseDto.user_id,
      amount: totalAmount,
      date: new Date(),
      payment_method: createPurchaseDto.payment_method,
      promo_code: createPurchaseDto.promo_code,
      status: 'completed'
    });

    const savedPurchase = await this.purchaseRepository.save(purchase);

    const purchasedProducts = createPurchaseDto.products.map(product => ({
      purchase_id: savedPurchase.purchase_id,
      product_id: product.product_id,
      quantity: product.quantity,
      price: product.price,
      amount: product.price * product.quantity
    }));

    await this.purchasedProductRepository.insert(purchasedProducts);

    return savedPurchase;
  }*/

  async findAll() {
    return await this.purchaseRepository.find({
      relations: ['user', 'purchasedProducts', 'purchasedProducts.product']
    });
  }

  async findOne(purchase_id: number) {
    return await this.purchaseRepository.findOne({
      where: { purchase_id },
      relations: ['user', 'purchasedProducts', 'purchasedProducts.product']
    });
  }
  async findByUser(user_id: number) {
    const purchases = await this.purchaseRepository
      .createQueryBuilder('purchase')
      .leftJoinAndSelect('purchase.purchasedProducts', 'purchasedProducts')
      .leftJoinAndSelect('purchasedProducts.product', 'product')
      .leftJoinAndSelect('purchase.user', 'user')
      .where('purchase.user_id = :user_id', { user_id })
      .getMany();
  
    const userData = purchases[0]?.user;
    
    return {
      user: userData,
      purchases: purchases.map(purchase => {
        const { user, ...purchaseData } = purchase;
        return purchaseData;
      })
    };
  }
  async findByPriceRange(min: number, max: number) {
    if (isNaN(min) || isNaN(max)) {
      throw new BadRequestException('Min and max must be valid numbers');
    }
  
    const purchases = await this.purchaseRepository
      .createQueryBuilder('purchase')
      .leftJoinAndSelect('purchase.purchasedProducts', 'purchasedProducts')
      .leftJoinAndSelect('purchasedProducts.product', 'product')
      .leftJoinAndSelect('purchase.user', 'user')
      .select([
        'purchase',
        'purchasedProducts',
        'product',
        'user.user_id',
        'user.fullname',
        'user.username',
        'user.email',
        'user.personal_ID',
        'user.status'
      ])
      .where('CAST(purchase.amount AS DECIMAL) BETWEEN :min AND :max', { 
        min: min,
        max: max 
      })
      .getMany();
  
    if (purchases.length === 0) {
      return {
        message: `No purchases found between $${min} and $${max}`,
        data: []
      };
    }
  
    return {
      message: 'Purchases found successfully',
      data: purchases
    };
  }
  
  
  async findByDateRange(startDate: string, endDate: string) {
    if (!startDate || !endDate) {
      throw new BadRequestException('Start date and end date are required');
    }
  
    const purchases = await this.purchaseRepository
      .createQueryBuilder('purchase')
      .leftJoinAndSelect('purchase.purchasedProducts', 'purchasedProducts')
      .leftJoinAndSelect('purchasedProducts.product', 'product')
      .leftJoinAndSelect('purchase.user', 'user')
      .select([
        'purchase',
        'purchasedProducts',
        'product',
        'user.user_id',
        'user.fullname',
        'user.username',
        'user.email',
        'user.personal_ID',
        'user.status'
      ])
      .where('purchase.date BETWEEN :startDate AND :endDate', {
        startDate: new Date(startDate),
        endDate: new Date(endDate)
      })
      .getMany();
  
    if (purchases.length === 0) {
      return {
        message: `No purchases found between ${startDate} and ${endDate}`,
        data: []
      };
    }
  
    return {
      message: 'Purchases found successfully',
      data: purchases
    };
  }
  
  async findByUserAndDateRange(userId: number, startDate: string, endDate: string) {
    if (!startDate || !endDate) {
      throw new BadRequestException('Start date and end date are required');
    }
  
    const purchases = await this.purchaseRepository
      .createQueryBuilder('purchase')
      .leftJoinAndSelect('purchase.purchasedProducts', 'purchasedProducts')
      .leftJoinAndSelect('purchasedProducts.product', 'product')
      .leftJoinAndSelect('purchase.user', 'user')
      .select([
        'purchase',
        'purchasedProducts',
        'product',
        'user.user_id',
        'user.fullname',
        'user.username',
        'user.email',
        'user.personal_ID',
        'user.status'
      ])
      .where('purchase.user_id = :userId', { userId })
      .andWhere('purchase.date BETWEEN :startDate AND :endDate', {
        startDate: new Date(startDate),
        endDate: new Date(endDate)
      })
      .getMany();
  
    if (purchases.length === 0) {
      return {
        message: `No purchases found for user ${userId} between ${startDate} and ${endDate}`,
        data: []
      };
    }
  
    return {
      message: 'Purchases found successfully',
      data: purchases
    };
  }
  
  async getStatistics(startDate?: string, endDate?: string) {
    const queryBuilder = this.purchaseRepository
      .createQueryBuilder('purchase')
      .leftJoin('purchase.purchasedProducts', 'purchasedProducts');
  
    if (startDate && endDate) {
      queryBuilder.where('purchase.date BETWEEN :startDate AND :endDate', {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      });
    }
  
    const totalPurchases = await queryBuilder.getCount();
    const totalAmount = await queryBuilder
      .select('SUM(purchase.amount)', 'total')
      .getRawOne();
      
    const totalProducts = await queryBuilder
      .select('SUM(purchasedProducts.quantity)', 'total')
      .getRawOne();
  
    const averageAmount = await queryBuilder
      .select('AVG(purchase.amount)', 'average')
      .getRawOne();
  
    const minMaxAmount = await queryBuilder
      .select([
        'MIN(purchase.amount) as min_amount',
        'MAX(purchase.amount) as max_amount'
      ])
      .getRawOne();
  
    const firstLastPurchase = await queryBuilder
      .select([
        'MIN(purchase.date) as first_purchase',
        'MAX(purchase.date) as last_purchase'
      ])
      .getRawOne();
  
    const topProducts = await this.purchaseRepository
      .createQueryBuilder('purchase')
      .leftJoin('purchase.purchasedProducts', 'purchasedProducts')
      .leftJoin('purchasedProducts.product', 'product')
      .select([
        'product.name',
        'SUM(purchasedProducts.quantity) as total_quantity',
        'SUM(purchasedProducts.amount) as total_amount'
      ])
      .groupBy('product.product_id')
      .orderBy('total_quantity', 'DESC')
      .limit(5)
      .getRawMany();
  
    return {
      message: 'Statistics retrieved successfully',
      data: {
        period: {
          from: startDate || 'All time',
          to: endDate || 'All time',
        },
        totalPurchases,
        totalAmount: totalAmount.total || 0,
        totalProducts: totalProducts.total || 0,
        averageAmount: averageAmount.average || 0,
        minAmount: minMaxAmount.min_amount || 0,
        maxAmount: minMaxAmount.max_amount || 0,
        firstPurchase: firstLastPurchase.first_purchase,
        lastPurchase: firstLastPurchase.last_purchase,
        topProducts,
      }
    };
  }


  async getUserStatistics(userId: number, startDate?: string, endDate?: string) {
    const queryBuilder = this.purchaseRepository
      .createQueryBuilder('purchase')
      .leftJoin('purchase.purchasedProducts', 'purchasedProducts')
      .where('purchase.user_id = :userId', { userId });
  
    if (startDate && endDate) {
      queryBuilder.andWhere('purchase.date BETWEEN :startDate AND :endDate', {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      });
    }
  
    const totalPurchases = await queryBuilder.getCount();
    const totalAmount = await queryBuilder
      .select('SUM(purchase.amount)', 'total')
      .getRawOne();
      
    const totalProducts = await queryBuilder
      .select('SUM(purchasedProducts.quantity)', 'total')
      .getRawOne();
  
    const averageAmount = await queryBuilder
      .select('AVG(purchase.amount)', 'average')
      .getRawOne();
  
    const minMaxAmount = await queryBuilder
      .select([
        'MIN(purchase.amount) as min_amount',
        'MAX(purchase.amount) as max_amount'
      ])
      .getRawOne();
  
    const firstLastPurchase = await queryBuilder
      .select([
        'MIN(purchase.date) as first_purchase',
        'MAX(purchase.date) as last_purchase'
      ])
      .getRawOne();
  
    const topProducts = await this.purchaseRepository
      .createQueryBuilder('purchase')
      .leftJoin('purchase.purchasedProducts', 'purchasedProducts')
      .leftJoin('purchasedProducts.product', 'product')
      .where('purchase.user_id = :userId', { userId })
      .select([
        'product.name',
        'SUM(purchasedProducts.quantity) as total_quantity',
        'SUM(purchasedProducts.amount) as total_amount'
      ])
      .groupBy('product.product_id')
      .orderBy('total_quantity', 'DESC')
      .limit(5)
      .getRawMany();
  
    const userData = await this.purchaseRepository
      .createQueryBuilder('purchase')
      .leftJoin('purchase.user', 'user')
      .select([
        'user.user_id',
        'user.fullname',
        'user.username',
        'user.email'
      ])
      .where('user.user_id = :userId', { userId })
      .getOne();
  
    return {
      message: 'User statistics retrieved successfully',
      data: {
        user: userData,
        period: {
          from: startDate || 'All time',
          to: endDate || 'All time',
        },
        totalPurchases,
        totalAmount: totalAmount.total || 0,
        totalProducts: totalProducts.total || 0,
        averageAmount: averageAmount.average || 0,
        minAmount: minMaxAmount.min_amount || 0,
        maxAmount: minMaxAmount.max_amount || 0,
        firstPurchase: firstLastPurchase.first_purchase,
        lastPurchase: firstLastPurchase.last_purchase,
        topProducts,
      }
    };
  }
  
  
  async create(createPurchaseDto: CreatePurchaseDto) {
    console.log('Received DTO:', createPurchaseDto); // Add this line to debug

    const purchase = this.purchaseRepository.create({
      user_id: createPurchaseDto.user_id,
      date: new Date(),
      payment_method: createPurchaseDto.payment_method || 'Not specified',
      promo_code: createPurchaseDto.promo_code || 'None',
      status: 'completed'
    });
      

    console.log('Created purchase entity:', purchase); // Add this line to debug

    let totalAmount = 0;
    const purchasedProducts: PurchasedProduct[] = [];
  
    for (const product of createPurchaseDto.products) {
      const productEntity = await this.productRepository.findOne({
        where: { product_id: product.product_id }
      });
  
      if (!productEntity) {
        throw new BadRequestException(`Product ${product.product_id} not found`);
      }
  
      const itemAmount = product.price * product.quantity;
      totalAmount += itemAmount;
  
      const purchasedProduct = this.purchasedProductRepository.create({
        product_id: product.product_id,
        quantity: product.quantity,
        price: product.price,
        amount: itemAmount
      });
      purchasedProducts.push(purchasedProduct);
    }
  
    purchase.amount = totalAmount;
    const savedPurchase = await this.purchaseRepository.save(purchase);
  
    const purchasedProductEntities = purchasedProducts.map(item => ({
      ...item,
      purchase_id: savedPurchase.purchase_id
    }));
  
    await this.purchasedProductRepository.insert(purchasedProductEntities);
  
    return {
      message: 'Purchase created successfully',
      data: savedPurchase
    };
  }

  async remove(id: number) {
    // First find the purchase to verify it exists
    const purchase = await this.purchaseRepository.findOne({
      where: { purchase_id: id },
      relations: ['purchasedProducts']
    });
  
    if (!purchase) {
      throw new NotFoundException(`Purchase with ID ${id} not found`);
    }
  
    // Delete associated purchased products first
    await this.purchasedProductRepository.delete({ purchase_id: id });
  
    // Delete the purchase
    await this.purchaseRepository.delete(id);
  
    return {
      message: `Purchase ${id} has been successfully deleted`,
      data: purchase
    };
  }
  
  
}

  
  
