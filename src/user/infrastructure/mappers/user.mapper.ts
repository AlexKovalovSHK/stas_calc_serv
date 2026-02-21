// infrastructure/mappers/user.mapper.ts

import { User as UserEntity } from '../../domain/entities/user.entity';

export class UserMapper {
  static toDomain(raw: any): UserEntity {
    return new UserEntity({
      id: raw._id ? raw._id.toString() : raw.id,
      name: raw.name,
      surname: raw.surname,
      email: raw.email,
      password: raw.password,
      role: Array.isArray(raw.role) ? raw.role : [raw.role || 'Student'],
      phone: raw.phone,
      telegramId: raw.telegram_id,
      telegramUsername: raw.telegram_username,
      avatar: raw.avatar,
    });
  }

  static toPersistence(ata: any) {
    return {
      // Убедитесь, что имена полей СЛЕВА совпадают с именами в @Prop вашей схемы!
      name: ata.name,
      surname: ata.surname,
      email: ata.email,
      password: ata.password,
      role: ata.role && ata.role.length > 0 ? ata.role : ['Student'],
      phone: ata.phone,
      telegram_id: ata.telegramId ?? ata.telegram_id,
      telegram_username: ata.telegramUsername ?? ata.telegram_username,
      avatar: ata.avatar,
    };
  }
}