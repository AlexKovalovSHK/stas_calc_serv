import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Teacher, TeacherId } from '../../domain';
import { ITeacherRepository } from '../../domain/repositories/teacher.repository.interface';
import { ITeacherMapper } from '../mappers/teacher.mapper';
import { TeacherSchema } from '../schemas/teacher.schema';

@Injectable()
export class TeacherRepository implements ITeacherRepository {
  constructor(
    // Внедрение модели Mongoose
    @InjectModel(TeacherSchema.name) 
    private readonly teacherModel: Model<TeacherSchema>,

    // Внедрение маппера по строковому токену
    @Inject('ITeacherMapper')
    private readonly mapper: ITeacherMapper,
  ) {}

  async save(teacher: Teacher): Promise<void> {
    // Преобразуем доменную сущность в объект для БД
    const persistenceTeacher = this.mapper.toPersistence(teacher);
    
    // Используем id из схемы (это string, созданный из TeacherId.value)
    await this.teacherModel.findOneAndUpdate(
      { id: persistenceTeacher.id },
      {
        $set: {
          name: persistenceTeacher.name,
          email: persistenceTeacher.email,
          bio: persistenceTeacher.bio,
          specialization: persistenceTeacher.specialization,
          updatedAt: new Date(),
        },
        $setOnInsert: {
          createdAt: new Date(),
        }
      },
      { upsert: true, new: true },
    );
  }

  async findById(id: TeacherId): Promise<Teacher | null> {
    const teacherSchema = await this.teacherModel.findOne({ id: id.value }).exec();
    
    if (!teacherSchema) {
      return null;
    }

    // Преобразуем из БД в доменную сущность
    return this.mapper.toDomainFromPersistence(teacherSchema);
  }

  async findAll(): Promise<Teacher[]> {
    const teacherSchemas = await this.teacherModel.find().exec();
    
    // Используем стрелочную функцию, чтобы не терять контекст маппера
    return teacherSchemas.map(schema => this.mapper.toDomainFromPersistence(schema));
  }

  async delete(id: TeacherId): Promise<void> {
    // Удаляем по строковому значению ID
    await this.teacherModel.deleteOne({ id: id.value }).exec();
  }
}