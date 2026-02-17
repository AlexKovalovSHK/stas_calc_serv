import { Injectable } from '@nestjs/common';
import { Teacher, TeacherId } from '../../domain';
import { NewTeacherDto, TeacherDto, UpdateTeacherDto } from 'src/teachers/application';
import { TeacherSchema } from '../schemas/teacher.schema';

export interface ITeacherMapper {
  toDomain(dto: NewTeacherDto | UpdateTeacherDto): Teacher;
  // Изменили возвращаемый тип здесь
  toPersistence(teacher: Teacher): any; 
  toDomainFromPersistence(schema: TeacherSchema): Teacher;
  toDto(teacher: Teacher): TeacherDto;
}

@Injectable()
export class TeacherMapper implements ITeacherMapper {
  
  toDomain(dto: NewTeacherDto | UpdateTeacherDto): Teacher {
    const data = dto as any; 

    const teacherId = 'id' in dto && dto.id 
      ? new TeacherId(dto.id as string) 
      : TeacherId.create();

    // ВАЖНО: Порядок аргументов должен быть как в вашем классе Teacher:
    // id, name, email, createdAt, updatedAt, specialization, bio
    return new Teacher(
      teacherId,
      data.name ?? '',
      data.email ?? '',
      new Date(),
      new Date(),
      data.specialization ?? 'General',
      data.bio
    );
  }

  // ГЛАВНОЕ ИЗМЕНЕНИЕ ЗДЕСЬ
  toPersistence(teacher: Teacher): any {
    // Возвращаем простой объект (POJO), а не экземпляр класса
    return {
      id: teacher.id.value,
      name: teacher.name,
      email: teacher.email,
      bio: teacher.bio,
      specialization: teacher.specialization || '',
      createdAt: teacher.createdAt,
      updatedAt: teacher.updatedAt,
    };
  }

  toDomainFromPersistence(schema: TeacherSchema): Teacher {
    return new Teacher(
      new TeacherId(schema.id),
      schema.name,
      schema.email,
      schema.createdAt,
      schema.updatedAt,
      schema.specialization,
      schema.bio
    );
  }

  toDto(teacher: Teacher): TeacherDto {
    const dto = new TeacherDto();
    dto.id = teacher.id.value;
    dto.name = teacher.name;
    dto.email = teacher.email;
    dto.bio = teacher.bio;
    dto.specialization = teacher.specialization;
    dto.createdAt = teacher.createdAt;
    dto.updatedAt = teacher.updatedAt;
    return dto;
  }
}