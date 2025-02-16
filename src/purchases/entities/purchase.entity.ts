import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Users } from '../../users/user.entity';
import { PurchasedProduct } from './purchased-product.entity';

@Entity('purchases')
export class Purchase {
  @PrimaryGeneratedColumn({ name: 'purchase_id' })
  purchase_id: number;

  @Column({ name: 'user_id' })
  user_id: number;

  @Column('decimal', { precision: 50, scale: 2 })
  amount: number;

  @Column()
  date: Date;

  @Column({ nullable: true })
  payment_method: string;

  @Column({ default: 'Paid' })
  payment_status: string;

  @Column({ nullable: true })
  transaction_id: string;

  @Column({ default: 'Pending' })
  shipping_status: string;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  discount: number;

  @Column({ nullable: true })
  promo_code: string;

  @Column({ nullable: true })
  status: string;

  @ManyToOne(() => Users)
  @JoinColumn({ name: 'user_id' })
  user: Users;

  @OneToMany(() => PurchasedProduct, purchasedProduct => purchasedProduct.purchase)
  purchasedProducts: PurchasedProduct[];
}
