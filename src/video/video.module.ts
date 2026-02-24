import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MulterModule } from '@nestjs/platform-express';
import { VideoMongoModel, VideoSchema } from './models/video.models';
import { VideoController } from './controllers/video.controller';
import { VideoService } from './service/video.service';

@Module({
  imports: [
    // Регистрация схемы в БД
    MongooseModule.forFeature([
      { name: VideoMongoModel.name, schema: VideoSchema },
    ]),
  ],
  controllers: [ VideoController],
  providers: [VideoService],
  exports: [ VideoService],
})
export class VideoModule {}