// user.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Roles } from '../roles/role.entity';

@Entity()
export class Users {
  @PrimaryGeneratedColumn()
  user_id: number;

  @Column()
  google_id: string;

  @Column()
  facebook_id: string;

  @Column()
  github_id: string;

  @Column()
  twitter_id: string;

  @Column()
  fullname: string;

  @Column()
  username: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  personal_ID: string;



  @ManyToOne(() => Roles, (role) => role.users) // Define the relationship
  @JoinColumn({ name: 'role', referencedColumnName: 'id' }) // Map `role_id` to `id` in `roles`
  role: Roles; 
  
  @Column()
  phone: string;

  @Column()
  image: string;

  @Column()
  status: string;
}