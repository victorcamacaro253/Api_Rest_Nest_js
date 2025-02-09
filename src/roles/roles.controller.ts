import { Controller, Get } from '@nestjs/common';
import { RolesService } from './roles.service';
import { Roles } from './role.entity';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  async findAll(): Promise<Roles[]> {
    return this.rolesService.findAll();
  }
}