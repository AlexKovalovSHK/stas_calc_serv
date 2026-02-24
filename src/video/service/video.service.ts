import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { VideoDocument, VideoMongoModel } from '../models/video.models';
import { 
  S3Client, 
  PutObjectCommand, 
  DeleteObjectCommand, 
  GetObjectCommand 
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { ConfigService } from '@nestjs/config';
import { Upload } from '@aws-sdk/lib-storage';
import * as fs from 'fs'; 

@Injectable()
export class VideoService {
  private s3Client: S3Client;
  private readonly bucketName: string;

  constructor(
    @InjectModel(VideoMongoModel.name) private videoModel: Model<VideoDocument>,
    private configService: ConfigService,
  ) {
    this.s3Client = new S3Client({
      // Используем getOrThrow, чтобы гарантировать наличие строки
      endpoint: this.configService.getOrThrow<string>('S3_ENDPOINT'),
      region: this.configService.getOrThrow<string>('S3_REGION'),
      credentials: {
        accessKeyId: this.configService.getOrThrow<string>('S3_ACCESS_KEY'),
        secretAccessKey: this.configService.getOrThrow<string>('S3_SECRET_KEY'),
      },
      forcePathStyle: true,
    });

    this.bucketName = this.configService.getOrThrow<string>('S3_BUCKET_NAME');
  }

  // 1. Создание видео (Загрузка в MinIO)
  async create(data: any, file: Express.Multer.File): Promise<VideoDocument> {
    const fileKey = `${Date.now()}-${file.originalname}`;
    const fileStream = file.path ? fs.createReadStream(file.path) : file.buffer;

    try {
      const parallelUploads3 = new Upload({
        client: this.s3Client,
        params: {
          Bucket: this.bucketName,
          Key: fileKey,
          Body: fileStream,
          ContentType: file.mimetype,
        },
      });

      await parallelUploads3.done();

      // Сохранение в БД
      const newVideo = new this.videoModel({
        ...data,
        lessonId: data.lessonId || new Types.ObjectId(), 
        videoUrl: fileKey,
        status: 'ready',
      });
      
      return await newVideo.save();

    } catch (e) {
      console.error('Ошибка при загрузке:', e);
      throw e;
    } finally {
      // ГАРАНТИРОВАННАЯ ОЧИСТКА
      // Если файл был на диске, удаляем его вне зависимости от результата
      if (file.path && fs.existsSync(file.path)) {
        fs.unlink(file.path, (err) => {
          if (err) console.error(`Не удалось удалить временный файл: ${file.path}`, err);
        });
      }
    }
  }

  // 2. Получение ссылки для плеера (Presigned URL)
  async getVideoUrl(id: string): Promise<string> {
    const video = await this.findOne(id);
    
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: video.videoUrl,
    });

    // Ссылка будет работать 1 час (3600 сек)
    return getSignedUrl(this.s3Client, command, { expiresIn: 3600 });
  }

  // 3. Поиск всех (как и было)
  async findAll() {
    return this.videoModel.find().exec();
  }

  async findOne(id: string) {
    const video = await this.videoModel.findById(id);
    if (!video) throw new NotFoundException('Видео не найдено');
    return video;
  }

  // 4. Удаление (из БД и из MinIO)
  async delete(id: string) {
    const video = await this.findOne(id);

    // Удаляем из MinIO
    await this.s3Client.send(
      new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: video.videoUrl,
      }),
    );

    // Удаляем из БД
    return this.videoModel.findByIdAndDelete(id);
  }
}