// infrastructure/mappers/user.mapper.ts

import { User, User as UserEntity } from '../../domain/entities/user.entity';

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
      academicInfo: raw.academicInfo,
    });
  }

  static toPersistence(domain: any): any {
    const persistence: any = {
      name: domain.name,
      surname: domain.surname,
      email: domain.email,
      password: domain.password,
      role: domain.role,
      phone: domain.phone,
      avatar: domain.avatar,
      // Маппим поля телеграма
      telegram_id: domain.telegramId || domain.telegram_id,
      telegram_username: domain.telegramUsername || domain.telegram_username,
    };

    // Если есть данные academicInfo, маппим их аккуратно
    if (domain.academicInfo) {
      persistence.academicInfo = {
        ...(domain.academicInfo.subdivision && { subdivision: domain.academicInfo.subdivision }),
        ...(domain.academicInfo.course && { course: Number(domain.academicInfo.course) }),
        ...(domain.academicInfo.sessionNumber && { sessionNumber: domain.academicInfo.sessionNumber }),
        // Важно: преобразуем дату, если она пришла строкой из DTO
        ...(domain.academicInfo.enrollmentDate && { 
          enrollmentDate: new Date(domain.academicInfo.enrollmentDate) 
        }),
      };
    }

    // Удаляем undefined поля, чтобы не затереть данные в базе при $set
    Object.keys(persistence).forEach(key => {
      if (persistence[key] === undefined) {
        delete persistence[key];
      }
    });

    return persistence;
  }

}