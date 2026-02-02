import { CourseResponseDto } from "../dto/course.dto";
import { ModuleResponseDto } from "../dto/module.dto";
import { NewCourseDto } from "../dto/new-course.dto";
import { NewModuleDto } from "../dto/new-module.dto";
import { Course } from "../entitys/course.entity";


export interface ICoursesService {
    createCourse(course: NewCourseDto): Promise<CourseResponseDto>;
    getAllCourses(): Promise<CourseResponseDto[]>;
    getCourseById(id: string): Promise<CourseResponseDto>;
    deleteCourse(id: string): Promise<void>;
    getCourses(): Promise<CourseResponseDto[]>;
    getModulesByCourseId(courseId: string): Promise<ModuleResponseDto[]>;
    addModuleToCourse(module: NewModuleDto): Promise<ModuleResponseDto>;
    updateModule(moduleId: string, module: NewModuleDto): Promise<ModuleResponseDto>;
    deleteModule(moduleId: string): Promise<void>;
    getModuleById(moduleId: string): Promise<ModuleResponseDto>;
    getModules(): Promise<ModuleResponseDto[]>;

    getCourseByAuthorId(authorId: string): Promise<CourseResponseDto[]>;
}