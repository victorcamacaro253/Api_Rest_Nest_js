import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { sign, verify, JwtPayload } from 'jsonwebtoken';

@Injectable()
export class JwtUtils {
  constructor(private readonly configService: ConfigService) {}

  generateAccessToken(payload: any): string {
    const jwtSecret = this.configService.get<string>('JWT_SECRET');
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not defined in the environment variables');
    }
    return sign(payload, jwtSecret, { expiresIn: '1h' });
  }

  generateRefreshToken(payload: any): string {
    const jwtSecret = this.configService.get<string>('JWT_SECRET');
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not defined in the environment variables');
    }
    return sign(payload, jwtSecret, { expiresIn: '7d' });
  }

  verifyToken(token: string): JwtPayload | null {
    const secret = this.configService.get<string>('JWT_SECRET');
    if (!secret) throw new Error('JWT_SECRET is not defined');

    try {
      return verify(token, secret) as JwtPayload; // Cast to JwtPayload
    } catch (error) {
      // You can log the error or throw a custom exception
      console.error('Token verification failed:', error);
      return null; // or throw new UnauthorizedException();
    }
  }
}