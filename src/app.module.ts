import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { AuthModule } from './authentication/authentication.module';
import { ProductsModule } from './products/products.module';
import { LoginHistoryModule } from './login-history/login-history.module';

import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Makes the config globally available
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      driver: require('mysql2'), // 👈 Only if you installed mysql2
      host: process.env.DB_HOST, // Use environment variable
      port: 3306, // Use environment variable and convert to number
      username: process.env.DB_USERNAME, // Use environment variable
      password: process.env.DB_PASSWORD, // Use environment variable
      database: process.env.DB_DATABASE, // Use environment variable
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      // synchronize: true, // Automatically syncs the database schema (not recommended for production)
    }),
    UsersModule,
    RolesModule,
    AuthModule,
    ProductsModule,
    LoginHistoryModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}