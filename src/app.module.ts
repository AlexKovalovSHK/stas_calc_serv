import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { AppController } from './AppController';
import { PaymentsModule } from './paypal/payments.module';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { APP_GUARD } from '@nestjs/core';
import { TeacherModule } from './teachers/teacher.module';
import { CoursesModule } from './courses/courses.module';
import { HttpModule } from '@nestjs/axios';
import { TelegramModule } from './telegram/telegram.module';


const modules = [
  ConfigModule.forRoot({
    isGlobal: true,
    envFilePath: '.env',
  }),
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
  PaymentsModule,
  TeacherModule,
  TelegramModule.register(),
  HttpModule
];

@Module({
  imports: modules,
  controllers: [AppController],
  providers: [],
})
export class AppModule { }