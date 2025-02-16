import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Product } from '../../products/product.entity';
import { Purchase } from './purchase.entity';

@Entity('purchased_products')
export class PurchasedProduct {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  purchase_id: number;

  @Column()
  product_id: number;

  @Column()
  amount: number;

  @Column()
  quantity: number;

  @Column('decimal', { precision: 50, scale: 2 })
  price: number;

  @ManyToOne(() => Purchase, purchase => purchase.purchasedProducts)
  @JoinColumn({ name: 'purchase_id' })
  purchase: Purchase;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product: Product;
}
