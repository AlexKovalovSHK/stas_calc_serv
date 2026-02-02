import { InjectModel } from "@nestjs/mongoose";
import { ICoursesService } from "./courses.IService";
import { Injectable, NotFoundException } from "@nestjs/common";
import { Model } from "mongoose";
import { CourseResponseDto } from "../dto/course.dto";
import { ModuleResponseDto } from "../dto/module.dto";
import { NewCourseDto } from "../dto/new-course.dto";
import { NewModuleDto } from "../dto/new-module.dto";
import { CourseDocument, CourseMongoModel } from "../models/shemas/course.shema";
import { ModuleDocument, ModuleMongoModel } from "../models/shemas/module.shema";
import { CourseMapper } from "../infrastructure/mappers/course.mapper";
import { Course } from "../entitys/course.entity";
import { ModuleMapper } from "../infrastructure/mappers/module.mapper";

@Injectable()
export class CoursesService implements ICoursesService {
    constructor(
        @InjectModel(CourseMongoModel.name) private readonly courseModel: Model<CourseDocument>,
        @InjectModel(ModuleMongoModel.name) private readonly moduleModel: Model<ModuleDocument>,

    ) { }

    async createCourse(courseDto: NewCourseDto): Promise<CourseResponseDto> {
        // Создаем доменную сущность из DTO
        const course = new Course({
            title: courseDto.title,
            slug: courseDto.slug,
            description: courseDto.description,
            priceAmount: courseDto.priceAmount,
            priceCurrency: courseDto.priceCurrency,
            authorId: courseDto.authorId,
            note: courseDto.note || '',
            image: 'default-course-image.jpg',
            status: 'DRAFT',
            modules: [],
            createdAt: new Date(),
            updatedAt: new Date()
        });

        // Преобразуем в модель Mongoose и сохраняем
        const courseData = CourseMapper.toPersistence(course);
        const createdCourseDoc = await this.courseModel.create(courseData);

        // Преобразуем обратно в доменную сущность и DTO
        const domainCourse = CourseMapper.toDomain(createdCourseDoc);
        return CourseMapper.toResponseDto(domainCourse);
    }

    async getAllCourses(): Promise<CourseResponseDto[]> {
        const courseDocs = await this.courseModel.find().exec();
        return courseDocs.map(doc => {
            const domainCourse = CourseMapper.toDomain(doc);
            return CourseMapper.toResponseDto(domainCourse);
        });
    }

    async getCourseById(id: string): Promise<CourseResponseDto> {
        const courseDoc = await this.courseModel.findById(id).exec();
        if (!courseDoc) {
            throw new NotFoundException(`Course with ID ${id} not found`);
        }

        const domainCourse = CourseMapper.toDomain(courseDoc);
        return CourseMapper.toResponseDto(domainCourse);
    }

    async deleteCourse(id: string): Promise<void> {
        const courseDoc = await this.courseModel.findById(id).exec();
        if (!courseDoc) {
            throw new NotFoundException(`Course with ID ${id} not found`);
        }

        // Удаляем все модули курса
        await this.moduleModel.deleteMany({ courseId: id }).exec();

        // Удаляем сам курс
        await this.courseModel.findByIdAndDelete(id).exec();
    }

    async getCourses(): Promise<CourseResponseDto[]> {
        return this.getAllCourses();
    }

    async getModulesByCourseId(courseId: string): Promise<ModuleResponseDto[]> {
        // Проверяем существование курса
        const courseExists = await this.courseModel.exists({ _id: courseId });
        if (!courseExists) {
            throw new NotFoundException(`Course with ID ${courseId} not found`);
        }

        const moduleDocs = await this.moduleModel.find({ courseId }).exec();
        return moduleDocs.map(doc => {
            const domainModule = ModuleMapper.toDomain(doc);
            return ModuleMapper.toResponseDto(domainModule);
        });
    }

    async addModuleToCourse( dto: NewModuleDto): Promise<ModuleResponseDto> {
        const course = await this.courseModel.findById(dto.courseId);
        if (!course) throw new NotFoundException();

        const modDoc = await this.moduleModel.create({ ...dto });

        // ← Вот здесь ключевой момент
        const domainModule = ModuleMapper.toDomain(modDoc);

        await this.courseModel.updateOne(
            { _id: dto.courseId },
            { $addToSet: { modules: modDoc._id } }
        );

        // Теперь передаём правильный тип
        return ModuleMapper.toResponseDto(domainModule);
    }

    async updateModule(moduleId: string, moduleDto: NewModuleDto): Promise<ModuleResponseDto> {
        const moduleDoc = await this.moduleModel.findById(moduleId).exec();
        if (!moduleDoc) {
            throw new NotFoundException(`Module with ID ${moduleId} not found`);
        }

        // Обновляем только переданные поля
        const updateData: any = { updatedAt: new Date() };

        if (moduleDto.title !== undefined) updateData.title = moduleDto.title;
        if (moduleDto.description !== undefined) updateData.description = moduleDto.description;
        if (moduleDto.topics !== undefined) updateData.topics = moduleDto.topics;
        if (moduleDto.homework !== undefined) updateData.homework = moduleDto.homework;
        if (moduleDto.image !== undefined) updateData.image = moduleDto.image;
        if (moduleDto.author !== undefined) updateData.author = moduleDto.author;
        if (moduleDto.rating !== undefined) updateData.rating = moduleDto.rating;

        const updatedModuleDoc = await this.moduleModel.findByIdAndUpdate(
            moduleId,
            updateData,
            { new: true }
        ).exec();

        if (!updatedModuleDoc) {
            throw new NotFoundException(`Module with ID ${moduleId} not found after update`);
        }

        const domainModule = ModuleMapper.toDomain(updatedModuleDoc);
        return ModuleMapper.toResponseDto(domainModule);
    }

    async deleteModule(moduleId: string): Promise<void> {
        const moduleDoc = await this.moduleModel.findById(moduleId).exec();
        if (!moduleDoc) {
            throw new NotFoundException(`Module with ID ${moduleId} not found`);
        }

        const courseId = moduleDoc.courseId;

        // Удаляем модуль
        await this.moduleModel.findByIdAndDelete(moduleId).exec();

        // Удаляем ссылку на модуль из курса
        await this.courseModel.findByIdAndUpdate(
            courseId,
            { $pull: { modules: moduleId } }
        ).exec();
    }

    async getModuleById(moduleId: string): Promise<ModuleResponseDto> {
        const moduleDoc = await this.moduleModel.findById(moduleId).exec();
        if (!moduleDoc) {
            throw new NotFoundException(`Module with ID ${moduleId} not found`);
        }

        const domainModule = ModuleMapper.toDomain(moduleDoc);
        return ModuleMapper.toResponseDto(domainModule);
    }

    async getModules(): Promise<ModuleResponseDto[]> {
        const moduleDocs = await this.moduleModel.find().exec();
        return moduleDocs.map(doc => {
            const domainModule = ModuleMapper.toDomain(doc);
            return ModuleMapper.toResponseDto(domainModule);
        });
    }

    async getCourseByAuthorId(authorId: string): Promise<CourseResponseDto[]> {
        const courseDocs = await this.courseModel.find({ authorId }).exec();
        return courseDocs.map(doc => {
            const domainCourse = CourseMapper.toDomain(doc);
            return CourseMapper.toResponseDto(domainCourse);
        });
    }
}