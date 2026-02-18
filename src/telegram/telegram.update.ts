import { Update, Ctx, Start, On, Message } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { ConfigService } from '@nestjs/config';

@Update()
export class TelegramUpdate {
  constructor(private configService: ConfigService) {}

  private readonly adminId = this.configService.get<string>('ADMIN_TELEGRAM_ID') || '';

  @Start()
  async onStart(@Ctx() ctx: Context) {
    await ctx.reply('Здравствуйте! Напишите ваш вопрос, и наш администратор ответит вам в ближайшее время.');
  }

  // Когда клиент пишет боту
  @On('text')
  async onMessage(@Ctx() ctx: Context) {
    const message = ctx.message as any;
    const fromId = message.from.id;

    // Если пишет НЕ админ, пересылаем сообщение админу
    if (fromId.toString() !== this.adminId.toString()) {
      await ctx.telegram.sendMessage(
        this.adminId,
        `📩 Новое сообщение от курсанта (ID: ${fromId}):\n\n${message.text}`,
        {
          reply_markup: {
            inline_keyboard: [[{ text: 'Ответить', callback_data: `reply_${fromId}` }]],
          },
        },
      );
      await ctx.reply('Ваше сообщение отправлено администратору.');
    } 
    // Если пишет админ (логика ответа будет ниже)
    else {
        // Здесь можно добавить логику простого сообщения от админа
    }
  }
}