import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, User as UserEntity } from '../domain/entities/user.entity';
import { UserMapper } from '../infrastructure/mappers/user.mapper';
import { IUserRepository } from '../domain/repositories/user.repository.interface';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserMongoModel } from '../infrastructure/schemas/user.shema';

@Injectable()
export class UserService implements IUserRepository {
  constructor(
    @InjectModel(UserMongoModel.name) private readonly userModel: Model<UserMongoModel>,
  ) {}

  // Названия методов должны СТРОГО совпадать с интерфейсом IUserRepository
  async findById(id: string): Promise<UserEntity | null> {
    const user = await this.userModel.findById(id).exec();
    return user ? UserMapper.toDomain(user) : null;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await this.userModel.findOne({ email }).exec();
    return user ? UserMapper.toDomain(user) : null;
  }

  async findByTgId(tgId: string): Promise<UserEntity | null> {
    const user = await this.userModel.findOne({ telegram_id: Number(tgId) }).exec();
    return user ? UserMapper.toDomain(user) : null;
  }

 async create(user: Partial<UserEntity>): Promise<UserEntity> {
  const persistenceModel = UserMapper.toPersistence(user);
  console.log('Данные для MongoDB:', persistenceModel); 
  
  const newUser = new this.userModel(persistenceModel);
  const savedUser = await newUser.save();
  
  console.log('Сохранено в базу:', savedUser);
  return UserMapper.toDomain(savedUser);
}

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserEntity> {
    // Преобразуем DTO в формат полей БД
    const updateData = UserMapper.toPersistence(updateUserDto);

    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, { $set: updateData }, { new: true })
      .exec();

    if (!updatedUser) {
      throw new NotFoundException(`Пользователь с ID ${id} не найден`);
    }

    return UserMapper.toDomain(updatedUser);
  }

  async getUserList(): Promise<User[]> {
    try {
      const users = await this.userModel.find().exec();
      
      if (!users || users.length === 0) {
        return [];
      }
      
      return users.map(user => UserMapper.toDomain(user));
    } catch (error) {
      throw new BadRequestException(`Ошибка при получении списка пользователей: ${error.message}`);
    }
  }

  async setResetCode(userId: string, code: string): Promise<void> {
    const expires = new Date();
    expires.setMinutes(expires.getMinutes() + 15); // Код живет 15 минут

    const result = await this.userModel.findByIdAndUpdate(
      userId,
      {
        $set: {
          resetCode: code,
          resetCodeExpires: expires,
        },
      },
      { new: true },
    ).exec();

    if (!result) {
      throw new NotFoundException('Пользователь не найден при установке кода');
    }
  }

  /**
   * Обновляет пароль пользователя
   */
  async updatePassword(userId: string, hashedPassword: string): Promise<void> {
    const result = await this.userModel.findByIdAndUpdate(
      userId,
      {
        $set: {
          password: hashedPassword,
        },
      },
    ).exec();

    if (!result) {
      throw new NotFoundException('Пользователь не найден при обновлении пароля');
    }
  }

  /**
   * Очищает данные сброса пароля после успешного использования
   */
  async clearResetCode(userId: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(
      userId,
      {
        $set: {
          resetCode: null,
          resetCodeExpires: null,
        },
      },
    ).exec();
  }

  // Опционально: Метод для удаления (если нужно в репозитории)
  async delete(id: string): Promise<void> {
    const result = await this.userModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Пользователь с ID ${id} не найден`);
    }
  }

  // В UserService.ts

async updateTelegramInfo(
  userId: string, 
  data: { telegram_id: string; telegramUsername?: string; avatar?: string }
): Promise<UserEntity> {
  const updatedUser = await this.userModel
    .findByIdAndUpdate(
      userId,
      {
        $set: {
          telegram_id: Number(data.telegram_id), // Преобразуем в число, как в вашем findByTgId
          telegramUsername: data.telegramUsername,
          avatar: data.avatar,
        },
      },
      { new: true },
    )
    .exec();

  if (!updatedUser) {
    throw new NotFoundException(`Пользователь с ID ${userId} не найден`);
  }

  return UserMapper.toDomain(updatedUser);
}

async addRole(userId: string, role: string): Promise<UserEntity> {
  const updatedUser = await this.userModel
    .findByIdAndUpdate(
      userId,
      { $addToSet: { role: role } }, // Добавляет в массив, если нет
      { new: true }
    )
    .exec();

  if (!updatedUser) throw new NotFoundException('Пользователь не найден');
  return UserMapper.toDomain(updatedUser);
}

async removeRole(userId: string, role: string): Promise<UserEntity> {
  const updatedUser = await this.userModel
    .findByIdAndUpdate(
      userId,
      { $pull: { role: role } }, // Удаляет из массива
      { new: true }
    )
    .exec();

  if (!updatedUser) throw new NotFoundException('Пользователь не найден');
  return UserMapper.toDomain(updatedUser);
}

}