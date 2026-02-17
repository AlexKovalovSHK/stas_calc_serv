import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { TeacherService } from '../../services/teacher.service';
import { NewTeacherDto, TeacherDto, UpdateTeacherDto } from '../../application';

@Controller('teachers')
export class TeacherController {
  constructor(private readonly teacherService: TeacherService) {}

  @Post()
  async create(@Body() newTeacherDto: NewTeacherDto): Promise<TeacherDto> {
    return this.teacherService.createNewTeacher(newTeacherDto);
  }

  @Get()
  async findAll(): Promise<TeacherDto[]> {
    return this.teacherService.getAllTeachers();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<TeacherDto | null> {
    return this.teacherService.getTeacherById(id);
  }

  @Patch(':id')
  async update(
    @Body() updateTeacherDto: UpdateTeacherDto,
  ): Promise<TeacherDto> {
    return this.teacherService.updateTeacher(updateTeacherDto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<boolean> {
    return this.teacherService.deleteTeacher(id);
  }
}
