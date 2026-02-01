import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, User as UserEntity } from '../domain/entities/user.entity'; // Ваша чистая сущность
import { UserMapper } from '../infrastructure/mappers/user.mapper'; // Преобразователь
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
    // Преобразуем строку в число, так как в схеме telegram_id: number
    const user = await this.userModel.findOne({ telegram_id: Number(tgId) }).exec();
    return user ? UserMapper.toDomain(user) : null;
  }

 async create(user: Partial<UserEntity>): Promise<UserEntity> {
  const persistenceModel = UserMapper.toPersistence(user);
  console.log('Данные для MongoDB:', persistenceModel); // <-- Проверьте это в консоли терминала
  
  const newUser = new this.userModel(persistenceModel);
  const savedUser = await newUser.save();
  
  console.log('Сохранено в базу:', savedUser); // <-- Если здесь есть объект с _id, значит в базе он ТОЧНО есть
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
}