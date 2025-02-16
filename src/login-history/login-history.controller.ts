import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { LoginHistoryService } from './login-history.service';
import { AuthGuard } from 'src/authentication/guards/auth.guard';

@Controller('login-history')
//@UseGuards(AuthGuard)
export class LoginHistoryController {
  constructor(private readonly loginHistoryService: LoginHistoryService) {}

  @Get()
  findAll() {
    return this.loginHistoryService.findAll();
  }

  @Get('user/:userId')
  findByUserId(@Param('userId') userId: string) {
    return this.loginHistoryService.findByUserId(+userId);
  }
}
