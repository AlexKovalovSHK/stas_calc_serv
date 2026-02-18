import { Update, Ctx, Start, On, Command } from 'nestjs-telegraf';
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

  /**
   * КОМАНДА /id
   */
  @Command('id')
  async onIdCommand(@Ctx() ctx: Context) {
    const from = ctx.from;
    
    // Проверка: если отправителя нет (редкий случай для команд), выходим
    if (!from) return;

    await ctx.reply(`✅ ${from.first_name}, ваш Telegram ID: ${from.id}`);
    
    await ctx.telegram.sendMessage(
      this.adminId,
      `🆔 <b>Регистрация ID:</b>\nИмя: ${from.first_name}\nID: <code>${from.id}</code>`,
      { parse_mode: 'HTML' }
    );
  }

  /**
   * ОБРАБОТКА ТЕКСТОВЫХ СООБЩЕНИЙ
   */
  @On('text')
  async onMessage(@Ctx() ctx: Context) {
    // Используем проверку на существование всех необходимых полей
    if (!ctx.from || !ctx.chat || !('text' in ctx.message!)) return;

    const message = ctx.message as any;
    const from = ctx.from;
    const chat = ctx.chat;
    const fromId = from.id;

    // 1. ЛОГИКА ДЛЯ ГРУППЫ
    if (chat.type === 'group' || chat.type === 'supergroup') {
      console.log(`👥 Группа "${(chat as any).title}": Сообщение от ${from.first_name} (ID: ${fromId})`);
      return; 
    }

    // 2. ЛОГИКА ПОДДЕРЖКИ (Личные сообщения)
    if (chat.type === 'private') {
      if (fromId.toString() !== this.adminId.toString()) {
        await ctx.telegram.sendMessage(
          this.adminId,
          `📩 <b>Новое сообщение:</b>\nОт: ${from.first_name} (@${from.username || 'нет'})\nID: ${fromId}\n\n💬 ${message.text}`,
          {
            parse_mode: 'HTML',
            reply_markup: {
              inline_keyboard: [[{ text: 'Ответить', callback_data: `reply_${fromId}` }]],
            },
          },
        );
        await ctx.reply('Ваше сообщение отправлено администратору.');
      } 
      else {
        await ctx.reply('Вы в режиме администратора. Чтобы ответить пользователю, используйте формат: [ID] [текст]');
      }
    }
  }

  /**
   * ЛОГИКА ДЛЯ НОВЫХ УЧАСТНИКОВ ГРУППЫ
   */
  @On('new_chat_members')
  async onNewMember(@Ctx() ctx: Context) {
    // Проверяем наличие сообщения
    if (!ctx.message || !('new_chat_members' in ctx.message)) return;

    const message = ctx.message as any;
    const newMembers = message.new_chat_members;

    for (const member of newMembers) {
      if (member.is_bot) continue;

      await ctx.telegram.sendMessage(
        this.adminId,
        `👋 <b>Новый участник группы:</b>\nИмя: ${member.first_name}\nID: <code>${member.id}</code>`,
        { parse_mode: 'HTML' }
      );
    }
  }
}