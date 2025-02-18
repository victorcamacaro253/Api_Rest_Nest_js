import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('refresh_tokens')
export class RefreshToken {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  @Column()
  token: string;

  @Column()
  expiresIn: Date;

  @Column()
  revoked: boolean;

  @Column()
  createdAt: Date;

  @Column()
  updatedAt: Date;
}
