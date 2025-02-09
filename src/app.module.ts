import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      driver: require('mysql2'), // 👈 Solo si instalaste mysql2

      host: 'localhost', // Replace with your MySQL host
      port: 3306,        // Replace with your MySQL port
      username: 'root',  // Replace with your MySQL username
      password: '', // Replace with your MySQL password
      database: 'victor_en', // Replace with your MySQL database name
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
     // synchronize: true, // Automatically syncs the database schema (not recommended for production)
    }),
    UsersModule,
    RolesModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
