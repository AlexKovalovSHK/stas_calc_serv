import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type VideoDocument = VideoMongoModel & Document;

@Schema({ 
    collection: 'ifob_scool_videos',
    timestamps: true 
})
export class VideoMongoModel {
    _id: Types.ObjectId;

    @Prop({ required: true, index: true })
    title: string;

    @Prop()
    description: string;

    // Ссылка на курс или урок
    @Prop({ type: Types.ObjectId, ref: 'Lesson', required: true })
    lessonId: Types.ObjectId;

    @Prop({ required: true })
    authorId: string;

    // Путь к файлу (напр. /uploads/videos/lesson_1.mp4)
    @Prop({ required: true })
    videoUrl: string;

    // Тип хранения: 'local', 's3', 'vimeo', 'youtube'
    @Prop({ default: 'local' })
    storageProvider: string;

    @Prop({ default: 0 })
    duration: number; // Длительность в секундах

    @Prop({ default: 'processing' }) // processing, ready, error
    status: string;

    @Prop()
    thumbnailUrl: string;

    @Prop({ type: [String], default: [] })
    allowedGroupIds: string[]; // Для групповых уроков: ID групп, которым доступно видео

    @Prop({ default: 0 })
    order: number; // Порядок видео в уроке (если их несколько)
}

export const VideoSchema = SchemaFactory.createForClass(VideoMongoModel);