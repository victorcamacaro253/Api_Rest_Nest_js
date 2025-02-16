import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { LoggingMiddleware } from './middleware/logging.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = new DocumentBuilder()
  .setTitle('Your API Title')
  .setDescription('Your API Description')
  .setVersion('1.0')
  .addBearerAuth()
  .build();

const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('api', app, document);

app.enableCors({
  origin: '*',
  methods: 'GET,POST,PUT,DELETE',
  credentials: true,
  allowedHeaders: 'Content-Type, Authorization',
});



  app.use(new LoggingMiddleware().use);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
