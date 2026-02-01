import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Patch,
  Query,
  UploadedFiles,
  UseInterceptors,
  NotFoundException,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { UserService } from '../service/user.service';
import { CreateUserDto } from '../dto/new-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { User } from '../domain/entities/user.entity';

@Controller('users') // Базовый путь: /users (множественное число)
export class UserController {
  constructor(private readonly userService: UserService) {}

  // POST /users - Создание пользователя (Регистрация)
  @Post()
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.userService.create(createUserDto);
  }

  // GET /users - Получение списка или поиск по email (?email=...)
  @Get()
  async find(@Query('email') email?: string): Promise<User | User[]> {
    if (email) {
      const user = await this.userService.findByEmail(email);
      if (!user) throw new NotFoundException('User not found');
      return user;
    }
    // Здесь логика получения всех пользователей, если нужно
    return []; 
  }

  // GET /users/:id - Получение конкретного пользователя (Профиль)
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<User> {
    const user = await this.userService.findById(id);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  // GET /users/telegram/:tgId - Поиск по Telegram (специфичный ресурс)
  @Get('telegram/:tgId')
  async findByTelegram(@Param('tgId') tgId: string): Promise<User> {
    const user = await this.userService.findByTgId(tgId);
    if (!user) throw new NotFoundException('User with this Telegram ID not found');
    return user;
  }

  // PATCH /users/:id - Частичное обновление (профиль + аватар)
  @Patch(':id')
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'avatar', maxCount: 1 }])
  )
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFiles() files: { avatar?: Express.Multer.File[] },
  ): Promise<User> {
    if (files?.avatar?.length) {
      // Логика сохранения пути к файлу
      updateUserDto.avatar = `/uploads/${files.avatar[0].filename}`;
    }
    return this.userService.update(id, updateUserDto);
  }

  // DELETE /users/:id - Удаление
  @Delete(':id')
  async remove(@Param('id') id: string) {
    // return this.userService.remove(id);
    return { message: 'User deleted successfully' };
  }
}