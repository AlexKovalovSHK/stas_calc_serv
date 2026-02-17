import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
    UsePipes,
    ValidationPipe,
    HttpCode,
    HttpStatus,
    ParseUUIDPipe,
    BadRequestException,
    Req,
} from '@nestjs/common';
import { CourseResponseDto } from '../dto/course.dto';
import { NewCourseDto } from '../dto/new-course.dto';
import { NewModuleDto } from '../dto/new-module.dto';
import { ModuleResponseDto } from '../dto/module.dto';
import { CoursesService } from '../services/courses.service';

@Controller('courses')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class CoursesController {
    constructor(private readonly coursesService: CoursesService) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async createCourse(
        @Body() createCourseDto: NewCourseDto,
    ): Promise<CourseResponseDto> {
        console.log(createCourseDto);

        return this.coursesService.createCourse(createCourseDto);
    }

    @Get()
    async getAllCourses(
        @Query('authorId') authorId?: string,
    ): Promise<CourseResponseDto[]> {
        if (authorId) {
            return this.coursesService.getCourseByAuthorId(authorId);
        }
        return this.coursesService.getAllCourses();
    }

    @Get(':id')
    async getCourseById(
        @Param('id') id: string,
    ): Promise<CourseResponseDto> {
        return this.coursesService.getCourseById(id);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async deleteCourse(
        @Param('id') id: string,
    ): Promise<void> {
        return this.coursesService.deleteCourse(id);
    }

    // Модули курса
    @Get(':courseId/modules')
    async getCourseModules(
        @Param('courseId') courseId: string,
    ): Promise<ModuleResponseDto[]> {
        return this.coursesService.getModulesByCourseId(courseId);
    }

    @Post('/modules')
    @HttpCode(HttpStatus.CREATED)
    async addModuleToCourse(
        @Body() createModuleDto: NewModuleDto,
        @Req() req: Request,
    ) {
        console.log('Raw body (string):', req.body); 
        console.log('Parsed DTO:', createModuleDto);  
        console.log('Content-Type:', req.headers['content-type']);

        if (!createModuleDto) {
            throw new BadRequestException('No body received');
        }

        if (!/^[0-9a-fA-F]{24}$/.test(createModuleDto.courseId)) {
            throw new BadRequestException('Invalid course ID format');
        }

        return this.coursesService.addModuleToCourse(createModuleDto);
    }
}