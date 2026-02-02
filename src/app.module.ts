import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { AppController } from './AppController';
import { CoursesModule } from './courses/courses.module';
import { PaymentsModule } from './paypal/payments.module';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { APP_GUARD } from '@nestjs/core';


@Module({
  imports: [
    // Загрузка .env файла
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    // Подключение MongoDB
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
        dbName: configService.get<string>('MONGODB_NAME'),
      }),
      inject: [ConfigService],
    }),
    UserModule,
    AuthModule,
    CoursesModule,
    PaymentsModule
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard, // Теперь гвард будет проверять каждый запрос
    },
  ],
})
export class AppModule { }