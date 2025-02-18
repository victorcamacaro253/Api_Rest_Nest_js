import { Controller, Post, Body,Req,Get,UseGuards,Res } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';


@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthenticationService) {}

  @Post('login')
  async login(
    @Body('email') email: string, 
    @Body('password') password: string,
    @Res({ passthrough: true }) response: Response
  ) {
    const result = await this.authService.login(email, password);
    
    response.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    return result;
  }

  @Post('logout')
async logout(@Res({ passthrough: true }) response: Response) {
  response.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });

  return { message: 'Logged out successfully' };
}
 
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req) {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req) {
    return this.authService.googleLogin(req.user);
  }


}
export { AuthenticationService };

