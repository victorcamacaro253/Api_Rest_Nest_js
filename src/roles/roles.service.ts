import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Roles } from './role.entity';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Roles)
    private rolesRepository: Repository<Roles>,
  ) {}

  async findAll(): Promise<Roles[]> {
    return this.rolesRepository.find();
  }
}