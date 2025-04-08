import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { RechnungModule } from './rechnung/rechnung.model';
import { AppController } from './AppController';
import { DocumentPdf3Module } from './documents/document.module';


@Module({
  imports: [
    // Загрузка .env файла
    ConfigModule.forRoot({
      isGlobal: true, // Делаем конфиг глобально доступным
      envFilePath: '.env',
    }),
    //MongooseModule.forRoot('mongodb://mongo_admin_report:yjF76hbK5RQw3guY@81.169.234.249:27017/admin?tlsAllowInvalidCertificates=true'),
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
    RechnungModule,
    DocumentPdf3Module,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}