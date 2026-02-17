import { 
  Inject, 
  Injectable, 
  NotFoundException, 
  InternalServerErrorException 
} from '@nestjs/common';
import { 
  ITeacherService, 
  NewTeacherDto, 
  TeacherDto, 
  UpdateTeacherDto 
} from '../application';
import { 
  ITeacherRepository, 
  Teacher, 
  TeacherId 
} from '../domain';
import { ITeacherMapper } from '../infrastructure/mappers/teacher.mapper';

@Injectable()
export class TeacherService implements ITeacherService {
  constructor(
    // 1. Внедряем Репозиторий по строковому токену
    @Inject('ITeacherRepository') 
    private readonly teacherRepository: ITeacherRepository,
    
    // 2. Внедряем Маппер по строковому токену
    @Inject('ITeacherMapper') 
    private readonly teacherMapper: ITeacherMapper,
  ) { }

  async createNewTeacher(dto: NewTeacherDto): Promise<TeacherDto> {
    console.log(dto);
    
    try {
      const teacher = Teacher.create(
        dto.name,
        dto.email,
        dto.specialization || '', 
        dto.bio,  
      );

      // Сохраняем через репозиторий
      await this.teacherRepository.save(teacher);

      // Возвращаем DTO
      return this.teacherMapper.toDto(teacher);
    } catch (error) {
      console.error('Ошибка при создании преподавателя:', error);
      throw new InternalServerErrorException('Не удалось создать преподавателя');
    }
  }

  async getAllTeachers(): Promise<TeacherDto[]> {
    const teachers = await this.teacherRepository.findAll();
    // Используем стрелочную функцию, чтобы не потерять контекст this в маппере
    return teachers.map(teacher => this.teacherMapper.toDto(teacher));
  }

  async getTeacherById(id: string): Promise<TeacherDto> {
    const teacherId = new TeacherId(id);
    const teacher = await this.teacherRepository.findById(teacherId);

    if (!teacher) {
      throw new NotFoundException(`Преподаватель с ID ${id} не найден`);
    }

    return this.teacherMapper.toDto(teacher);
  }

  async updateTeacher(dto: UpdateTeacherDto): Promise<TeacherDto> {
    const teacherId = new TeacherId(dto.id);
    const teacher = await this.teacherRepository.findById(teacherId);

    if (!teacher) {
      throw new NotFoundException(`Преподаватель с ID ${dto.id} не найден`);
    }

    // Применяем изменения через доменные методы
    if (dto.name) teacher.changeName(dto.name);
    if (dto.email) teacher.changeEmail(dto.email);
    if (dto.bio !== undefined) teacher.changeBio(dto.bio);
    if (dto.specialization) teacher.changeSpecialization(dto.specialization);

    await this.teacherRepository.save(teacher);
    return this.teacherMapper.toDto(teacher);
  }

  async deleteTeacher(id: string): Promise<boolean> {
    const teacherId = new TeacherId(id);
    const teacher = await this.teacherRepository.findById(teacherId);

    if (!teacher) {
      throw new NotFoundException(`Преподаватель с ID ${id} не найден`);
    }

    await this.teacherRepository.delete(teacherId);
    return true;
  }
}