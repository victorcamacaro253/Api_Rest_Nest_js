import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Roles } from './role.entity';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';

@Module({
  imports: [TypeOrmModule.forFeature([Roles])], // Importa la entidad Role
  controllers: [RolesController],
  providers: [RolesService],
  exports: [TypeOrmModule], // Exporta para que otros módulos puedan usar la entidad
})
export class RolesModule {} 