import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../shema/user.shema';
import { HydratedDocument, Model } from 'mongoose';
import { CreateUserDto } from '../dto/new-user.dto';
import { UserWithId } from '../shema/types';
import { UpdateUserDto } from '../dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  

  async create(dto: CreateUserDto): Promise<HydratedDocument<User>> {
    const user = await this.userModel.create({ ...dto });
    return user;
  }

  async getAll(count = 10, offset = 0): Promise<User[]> {
    const users = await this.userModel
      .find()
      .skip(Number(offset))
      .limit(Number(count));
    return users;
  }

  async getOne(id: string): Promise<User> {
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return user;
  }

  async delete(id: string): Promise<boolean> {
    const user = await this.userModel.findByIdAndDelete(id);
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return true
  }

  async updateUser(dto: UpdateUserDto): Promise<HydratedDocument<User>> {
    const { id, ...updateData } = dto;
  
    // Обновляем пользователя по его ID
    const user = await this.userModel.findByIdAndUpdate(
        id,
      { $set: updateData },
      { new: true }  // Параметр 'new' гарантирует, что вернется обновленный пользователь
    );
  
    // Если пользователь не найден, выбрасываем исключение
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
  
    return user;
  }

  async getUserByEmail(email: string): Promise<UserWithId | null> {
    const user = await this.userModel.findOne({ email }).lean();
    if (!user) return null;
    
    return { ...user, _id: user._id.toString() }; // ✅ Преобразуем _id в строку
}
}
