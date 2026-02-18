// src/telegram/telegram.module.ts
import { Module, Global, DynamicModule } from '@nestjs/common';
import { TelegrafModule } from 'nestjs-telegraf';
import { TelegramService } from './telegram.service';
import { TelegramUpdate } from './telegram.update';
import { ConfigService } from '@nestjs/config';

@Global()
@Module({})
export class TelegramModule {
  static register(): DynamicModule {
    const isEnabled = process.env.ENABLE_TELEGRAM === 'true';
    
    // Если Telegram отключен, мы просто не регистрируем провайдеров, 
    // которые требуют @InjectBot, или регистрируем их иначе.
    // Но проще всего загружать модуль целиком только при наличии флага.
    
    if (!isEnabled) {
      return {
        module: TelegramModule,
        providers: [],
        exports: [],
      };
    }

    return {
      module: TelegramModule,
      imports: [
        TelegrafModule.forRootAsync({
          useFactory: (config: ConfigService) => ({
            token: config.get<string>('TELEGRAM_BOT_TOKEN') || '',
          }),
          inject: [ConfigService],
        }),
      ],
      providers: [TelegramService, TelegramUpdate],
      exports: [TelegramService],
    };
  }
}