import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Users } from '../users/user.entity';
import { LoginHistory } from '../login-history/login-history.entity';
import { RefreshToken } from './strategies/refresh-token.entity';
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
    @InjectRepository(RefreshToken)
    private readonly tokenRepository: Repository<RefreshToken>,
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


      // Store refresh token in database
      const refreshTokenEntity = this.tokenRepository.create({
        user_id: user.user_id,
        token: refreshToken,
        expiresIn: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        revoked: false,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      await this.tokenRepository.save(refreshTokenEntity);


    return { message: 'Login successful', token, refreshToken };
  }

  async logout(userId: number) {
    // Clear refresh token from database
    await this.tokenRepository.delete({ user_id: userId });
  
    // Log the logout event
    const logoutHistory = this.loginHistoryRepository.create({
      user_id: userId,
      date: new Date(),
      code: 'LOGOUT'
    });
    await this.loginHistoryRepository.save(logoutHistory);
  
    return true;
  }


  async googleLogin(user: any) {
  if (!user) {
    throw new UnauthorizedException('No user from Google');
  }
  console.log(user)

  // Find or create user in your database
  let userRecord = await this.userRepository.findOne({
    where: { google_id: user.id }
  });

  let email = await this.userRepository.findOne({
    where: { email: user.email }
  });

 if(email){
  throw new UnauthorizedException('Email already exists');
  }

  if (!userRecord) {
    userRecord = this.userRepository.create({
      google_id : user.id,
      email: user.email,
      fullname: user.firstName,
      username: user.lastName,
      image: user.picture,
      // Set other necessary fields
    });
    await this.userRepository.save(userRecord);
  }

  const payload = { 
    user_id: userRecord.user_id, 
    email: userRecord.email, 
    role: userRecord.role 
  };
  
  const token = this.jwtUtils.generateAccessToken(payload);
  const refreshToken = this.jwtUtils.generateRefreshToken(payload);

  return {
    message: 'Google login successful',
    token,
    refreshToken,
    user: userRecord
  };
}
}
