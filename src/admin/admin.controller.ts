import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";
import { TelegramService } from "src/telegram/telegram.service";


@UseGuards(JwtAuthGuard)
@Controller('admin')
export class AdminController {
  constructor(private telegramService: TelegramService) {}

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
}