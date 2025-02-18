import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private configService: ConfigService) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID') || '',
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET') || '',
      callbackURL: 'http://localhost:3000/auth/google/callback',
      scope: ['email', 'profile'],
     // passReqToCallback: true,
    });
  }
  
  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const user = {
      id: profile.id, 
      email: profile.emails[0].value,
      firstName: profile.name?.givenName || '',
      lastName: profile.name?.familyName || '',
      picture: profile.photos?.[0]?.value || '',
      accessToken,
    };
    
    done(null, user);
    return user;
  }
}
