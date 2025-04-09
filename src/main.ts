import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import * as basicAuth from 'express-basic-auth';

async function bootstrap() {
  const PORT = process.env.PORT || 3000;
  const app = await NestFactory.create(AppModule);

  // Добавляем Basic Auth для Swagger
  app.use(
    ['/api/docs', '/api/docs-json'], // Ограничиваем доступ к Swagger UI и JSON
    basicAuth({
      users: { admin: 'Abc!1234' }, // Укажите логин и пароль
      challenge: true, // Включаем окно аутентификации в браузере
    }),
  );

  // Настройка Swagger
  const config = new DocumentBuilder()
    .setTitle('Heizreport SHK_info')
    .setDescription('Docs REST API')
    .setVersion('1.0.0')
    .addTag('ALEX K')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/api/docs', app, document);

  app.use(cookieParser()); // ✅ Подключаем обработку кук
  //app.enableCors();
  app.enableCors({
    origin: 'https://stas.shk.solutions', // Разрешаем фронтенд
    credentials: true, // Разрешаем передачу кук
  });
  // https://stas.shk.solutions
  // http://localhost:5173
  // https://stas.shk.solutions

  await app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

bootstrap();
