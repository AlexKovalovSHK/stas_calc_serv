import { Course } from "src/courses/entitys/course.entity";
import { CourseMongoModel } from "src/courses/models/shemas/course.shema";


export class CourseMapper {
    static toDomain(courseModel: CourseMongoModel & { _id: any }): Course {
        return new Course({
            id: courseModel._id?.toString(),
            title: courseModel.title,
            slug: courseModel.slug,
            description: courseModel.description,
            priceAmount: courseModel.priceAmount,
            priceCurrency: courseModel.priceCurrency,
            authorId: courseModel.authorId,
            note: courseModel.note,
            image: courseModel.image,
            status: courseModel.status,
            modules: courseModel.modules || [],
            createdAt: courseModel.createdAt,
            updatedAt: courseModel.updatedAt
        });
    }

    static toPersistence(course: Course): Partial<CourseMongoModel> {
        return {
            title: course.title,
            slug: course.slug,
            description: course.description,
            priceAmount: course.priceAmount,
            priceCurrency: course.priceCurrency,
            authorId: course.authorId,
            note: course.note,
            image: course.image,
            status: course.status,
            modules: course.modules
        };
    }

    static toResponseDto(course: Course): any {
        return {
            id: course.id,
            title: course.title,
            slug: course.slug,
            description: course.description,
            priceAmount: course.priceAmount,
            priceCurrency: course.priceCurrency,
            authorId: course.authorId,
            image: course.image,
            status: course.status,
            modulesCount: course.modules?.length || 0,
            createdAt: course.createdAt,
            updatedAt: course.updatedAt
        };
    }
}