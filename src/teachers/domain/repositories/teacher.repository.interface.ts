import { Teacher, TeacherId } from '../entities/teacher.entity';

export interface ITeacherRepository {
  save(teacher: Teacher): Promise<void>;
  findById(id: TeacherId): Promise<Teacher | null>;
  findAll(): Promise<Teacher[]>;
  delete(id: TeacherId): Promise<void>;
}
