import { Entity, PrimaryGeneratedColumn, Column,OneToMany } from 'typeorm';
import { Users } from '../users/user.entity';

@Entity({ name: 'roles' })
export class Roles {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  createdAt : Date;


  @OneToMany(() => Users, (user) => user.role) // Define the inverse relationship
  users: Users[];
}