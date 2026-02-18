// src/telegram/telegram.service.ts
import { Injectable } from '@nestjs/common';
import { InjectBot } from 'nestjs-telegraf';
import { Telegraf } from 'telegraf';

@Injectable()
export class TelegramService {
  constructor(@InjectBot() private bot: Telegraf<any>) {}

  async sendResetCode(tgId: string, code: string) {
    await this.bot.telegram.sendMessage(
      tgId,
      `🔑 <b>Код сброса пароля:</b> <code>${code}</code>\n\nЕсли вы не запрашивали сброс, просто игнорируйте это сообщение.`,
      { parse_mode: 'HTML' }
    );
  }
}