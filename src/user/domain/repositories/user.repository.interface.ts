import { UpdateUserDto } from 'src/user/dto/update-user.dto';
import { User } from '../entities/user.entity';

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByTgId(tgId: string): Promise<User | null>;
  create(user: Partial<User>): Promise<User>;
  update(id: string, user: UpdateUserDto): Promise<User>;

  getUserList(): Promise<User[]>

  updateTelegramInfo(userId: string, data: { 
    telegram_id: string; 
    telegramUsername?: string; 
    avatar?: string 
  }): Promise<User>;

  addRole(userId: string, role: string): Promise<User>;
removeRole(userId: string, role: string): Promise<User>;
}