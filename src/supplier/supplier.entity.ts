import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Stock } from '../stock/stock.entity';

@Entity('suppliers')
export class Supplier {
  @PrimaryGeneratedColumn({ name: 'supplier_id' })
  id: number;

  @Column()
  code: string;

  @Column()
  name: string;

  @Column()
  address: string;

  @Column()
  email: string;

  @Column()
  phone: string;

  @Column()
  description: string;

  @OneToMany(() => Stock, stock => stock.supplier)
  stocks: Stock[];
}
