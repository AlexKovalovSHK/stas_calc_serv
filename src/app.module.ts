import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { AppController } from './AppController';
import { PaymentsModule } from './paypal/payments.module';
import { TeacherModule } from './teachers/teacher.module';
import { CoursesModule } from './courses/courses.module';
import { HttpModule } from '@nestjs/axios';
import { TelegramModule } from './telegram/telegram.module';
import { AdminModule } from './admin/admin.module';
import { MetricsModule } from './analytics/metrics.module';
import { VideoModule } from './video/video.module';


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
  TypeOrmModule.forRootAsync({
    imports: [ConfigModule],
    useFactory: (configService: ConfigService) => ({
      type: 'sqlite',
      database: configService.get<string>('SQLITE_DB_PATH') || 'analytics.sqlite',
      autoLoadEntities: true,
      synchronize: true,
    }),
    inject: [ConfigService],
  }),
  UserModule,
  AuthModule,
  CoursesModule,
  PaymentsModule,
  TeacherModule,
  TelegramModule.register(),
  HttpModule,
  AdminModule,
  MetricsModule,
  VideoModule,
];

@Module({
  imports: modules,
  controllers: [AppController],
  providers: [],
})
export class AppModule { }