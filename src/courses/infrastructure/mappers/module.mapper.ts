import { Injectable } from "@nestjs/common";
import { Module } from "src/courses/entitys/module.entity";
import { ModuleDocument, ModuleMongoModel } from "src/courses/models/shemas/module.shema";


export class ModuleMapper {
    static toDomain(doc: ModuleDocument | ModuleMongoModel): Module {
        return new Module({
            id: doc._id.toString(),
            courseId: doc.courseId,
            title: doc.title,
            description: doc.description,
            topics: doc.topics ?? [],
            homework: doc.homework ?? '',
            image: doc.image ?? '',
            author: doc.author,
            rating: doc.rating ?? 0,
            createdAt: doc.createdAt ?? new Date(),
            updatedAt: doc.updatedAt ?? new Date(),
        });
    }

    static toPersistence(module: Module): Partial<ModuleMongoModel> {
        return {
            courseId: module.courseId,
            title: module.title,
            description: module.description,
            topics: module.topics,
            homework: module.homework,
            image: module.image,
            author: module.author,
            rating: module.rating
        };
    }

    static toResponseDto(module: Module): any {
        return {
            id: module.id,
            courseId: module.courseId,
            title: module.title,
            description: module.description,
            topics: module.topics,
            homework: module.homework,
            image: module.image,
            author: module.author,
            rating: module.rating,
            createdAt: module.createdAt,
            updatedAt: module.updatedAt
        };
    }
}