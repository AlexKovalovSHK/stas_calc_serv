import { BadRequestException, Body, Controller, Post, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";
import { TelegramService } from "src/telegram/telegram.service";
import { LoginUserDto } from "src/user/dto/login-user.dto";
import { UserService } from "src/user/service/user.service";


@UseGuards(JwtAuthGuard)
@Controller('admin')
export class AdminController {
  constructor(private telegramService: TelegramService,
    private userService: UserService
  ) {}

  @Post('send-broadcast')
  async sendBroadcast(@Body() dto: { message: string }) {
    const groupId = process.env.TELEGRAM_NOTIFICATIONS_GROUP_ID; // ID вашей группы в .env
    
    if (!groupId) throw new Error('Group ID not configured');

    await this.telegramService.sendMessage(
      groupId, 
      `📢 <b>Уведомление от администратора:</b>\n\n${dto.message}`
    );
    
    return { success: true };
  }

  @UseGuards(JwtAuthGuard)
@Post('send-user-message')
async sendUserMessage(@Body() dto: { userId: string, message: string }) {
  // 1. Ищем пользователя в базе
  const user = await this.userService.findById(dto.userId);
  
  if (!user || !user.telegramId) {
    throw new BadRequestException('У пользователя не привязан Telegram');
  }

  // 2. Отправляем сообщение через ваш TelegramService
  await this.telegramService.sendMessage(
    String(user.telegramId), 
    `✉️ <b>Сообщение от администратора:</b>\n\n${dto.message}`
  );

  return { success: true };
}

}