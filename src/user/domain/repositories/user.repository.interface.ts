import { UpdateUserDto } from 'src/user/dto/update-user.dto';
import { User } from '../entities/user.entity';

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByTgId(tgId: string): Promise<User | null>;
  create(user: Partial<User>): Promise<User>;
  update(id: string, user: UpdateUserDto): Promise<User>;
}