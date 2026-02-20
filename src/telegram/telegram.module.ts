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
    // Проверяем флаг включения ИЛИ окружение (например, отключаем на локалке если нет токена)
    const isEnabled = process.env.ENABLE_TELEGRAM === 'true';
    
    // Базовая конфигурация для динамического модуля
    const dynamicModule: DynamicModule = {
      module: TelegramModule,
      global: true, // Это сделает провайдеры доступными везде без импорта
    };

    if (!isEnabled) {
      // ИСКЛЮЧЕНИЕ ДЛЯ ЛОКАЛЬНОЙ РАЗРАБОТКИ / ТЕСТОВ
      return {
        ...dynamicModule,
        providers: [
          {
            // Вместо реального сервиса даем заглушку с теми же именами методов
            provide: TelegramService,
            useValue: {
              sendMessage: async (id: string, text: string) => {
                console.log(`[LOCAL DEV] TG Message to ${id} blocked: ${text}`);
              },
              sendResetCode: async (id: string, code: string) => {
                console.log(`[LOCAL DEV] TG Code to ${id} blocked: ${code}`);
              },
            },
          },
        ],
        exports: [TelegramService],
      };
    }

    // РАБОЧИЙ РЕЖИМ (ПРОДАКШЕН)
    return {
      ...dynamicModule,
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