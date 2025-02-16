import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LoginHistory } from './login-history.entity';

@Injectable()
export class LoginHistoryService {
  constructor(
    @InjectRepository(LoginHistory)
    private loginHistoryRepository: Repository<LoginHistory>,
  ) {}

  async create(userId: number): Promise<LoginHistory> {
    const code = Math.random().toString(36).substring(7).toUpperCase();
    const loginHistory = this.loginHistoryRepository.create({
      user_id: userId,
      date: new Date(),
      code
    });
    return await this.loginHistoryRepository.save(loginHistory);
  }

  
  async findByUserId(userId: number): Promise<LoginHistory[]> {
    return await this.loginHistoryRepository
      .createQueryBuilder('loginHistory')
      .leftJoinAndSelect('loginHistory.user', 'user')
      .select([
        'loginHistory.id',
        'loginHistory.user_id',
        'loginHistory.date',
        'loginHistory.code',
        'user.user_id',
        'user.fullname',
        'user.username',
        'user.email',
        'user.personal_ID',
        'user.status'
      ])
      .where('loginHistory.user_id = :userId', { userId })
      .orderBy('loginHistory.date', 'DESC')
      .getMany();
  }

  
  async findAll(): Promise<LoginHistory[]> {
    return await this.loginHistoryRepository
      .createQueryBuilder('loginHistory')
      .leftJoinAndSelect('loginHistory.user', 'user')
      .select([
        'loginHistory.id',
        'loginHistory.user_id',
        'loginHistory.date',
        'loginHistory.code',
        'user.user_id',
        'user.fullname',
        'user.username',
        'user.email',
        'user.personal_ID',
        'user.status'
      ])
      .orderBy('loginHistory.date', 'DESC')
      .getMany();
  }
}
