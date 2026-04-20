import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, User as UserEntity } from '../domain/entities/user.entity';
import { UserMapper } from '../infrastructure/mappers/user.mapper';
import { IUserRepository } from '../domain/repositories/user.repository.interface';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserMongoModel } from '../infrastructure/schemas/user.schema';

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

 /*async create(user: Partial<UserEntity>): Promise<UserEntity> {
  const persistenceModel = UserMapper.toPersistence(user);
  console.log('Данные для MongoDB:', persistenceModel); 
  
  const newUser = new this.userModel(persistenceModel);
  const savedUser = await newUser.save();
  
  console.log('Сохранено в базу:', savedUser);
  return UserMapper.toDomain(savedUser);
}*/

async create(userData: Partial<UserEntity>): Promise<UserEntity> {
  // 1. Безопасно достаем email
  const email = userData.email?.toLowerCase();
  if (!email) {
    throw new BadRequestException('Email обязателен');
  }

  // 2. Проверяем дубликат
  const existingUser = await this.userModel.findOne({ email });
  if (existingUser) {
    throw new BadRequestException('Пользователь с таким email уже существует');
  }

  // 3. Мапим в БД
  const persistenceModel = UserMapper.toPersistence(userData);
  const newUser = new this.userModel(persistenceModel);
  const savedUser = await newUser.save();
  
  return UserMapper.toDomain(savedUser);
}

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserEntity> {
    // Преобразуем DTO в формат полей БД
    const updateData = UserMapper.toPersistence(updateUserDto);

    // Используем "dot notation" для вложенных полей, чтобы не перезатереть весь объект academicInfo
    const finalUpdateData: any = {};
    for (const key in updateData) {
      if (updateData[key] !== undefined) {
        if (key === 'academicInfo' && typeof updateData[key] === 'object' && updateData[key] !== null) {
          for (const subKey in updateData[key]) {
            if (updateData[key][subKey] !== undefined) {
              finalUpdateData[`academicInfo.${subKey}`] = updateData[key][subKey];
            }
          }
        } else {
          finalUpdateData[key] = updateData[key];
        }
      }
    }

    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, { $set: finalUpdateData }, { new: true })
      .exec();

    if (!updatedUser) {
      throw new NotFoundException(`Пользователь с ID ${id} не найден`);
    }

    return UserMapper.toDomain(updatedUser);
  }

  async getUsersByFilter(filters: any): Promise<User[]> {
    const query: any = {};

    if (filters.course) {
      query['academicInfo.course'] = Number(filters.course);
    }

    if (filters.sessionNumber) {
      query['academicInfo.sessionNumber'] = filters.sessionNumber;
    }

    if (filters.startDate || filters.endDate) {
      query['academicInfo.enrollmentDate'] = {};
      if (filters.startDate) {
        query['academicInfo.enrollmentDate'].$gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        query['academicInfo.enrollmentDate'].$lte = new Date(filters.endDate);
      }
    }

    if (filters.subdivision) {
      query['academicInfo.subdivision'] = filters.subdivision;
    }

    const users = await this.userModel.find(query).exec();
    return users.map((user) => UserMapper.toDomain(user));
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
          telegram_username: data.telegramUsername,
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