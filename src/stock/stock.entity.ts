import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Product } from '../products/product.entity';
import { Supplier } from '../supplier/supplier.entity';

@Entity('stock')
export class Stock {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product' })
  product: Product;

  @Column()
  stock: number;

  @Column()
  status: string;

  @ManyToOne(() => Supplier)
  @JoinColumn({ name: 'supplier' })
  supplier: Supplier;

  @Column({ name: 'creatdAt' })
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
