import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Users } from '../users/user.entity';
import { LoginHistory } from '../login-history/login-history.entity';
import { compare } from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { JwtUtils } from '../utils/jwt.utils';
import { randomBytes } from 'crypto';


@Injectable()
export class AuthenticationService {
  constructor(
    @InjectRepository(Users)
    private readonly userRepository: Repository<Users>,
    @InjectRepository(LoginHistory)
    private readonly loginHistoryRepository: Repository<LoginHistory>,
    private readonly configService: ConfigService,
    private readonly jwtUtils: JwtUtils,
  ) {}

  async login(email: string, password: string) {
    const user = await this.userRepository.findOne({
      where: { email },
      relations: ['role'],
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isMatch = await compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const randomCode = randomBytes(8).toString('hex').toUpperCase();

    const loginHistory = this.loginHistoryRepository.create({
      user_id: user.user_id,
      date: new Date(),
      code: randomCode
    });
    await this.loginHistoryRepository.save(loginHistory);

    const payload = { user_id: user.user_id, email: user.email, role: user.role };
    const token = this.jwtUtils.generateAccessToken(payload);
    const refreshToken = this.jwtUtils.generateRefreshToken(payload);

    return { message: 'Login successful', token, refreshToken };
  }
}
