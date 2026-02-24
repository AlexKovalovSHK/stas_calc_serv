import {
    Controller, Post, Get, Delete, Param, UseInterceptors,
    UploadedFile, Body, Res, UseGuards
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Response } from 'express';
import { VideoService } from '../service/video.service';

@Controller('videos')
export class VideoController {
    constructor(private readonly videoService: VideoService) { }

    // 1. ЗАГРУЗКА ВИДЕО
    @Post('upload')
    @UseInterceptors(FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/temp', // Временная папка в корне проекта
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
    }))
    async uploadVideo(@UploadedFile() file: Express.Multer.File, @Body() body: any) {
      return this.videoService.create(body, file);
    }

    @Get(':id/link')
    async getLink(@Param('id') id: string) {
        const url = await this.videoService.getVideoUrl(id);
        return { url };
    }

    // 2. СТРИМИНГ (X-Accel-Redirect)
    @Get(':id/stream')
    async streamVideo(@Param('id') id: string, @Res() res: Response) {
        const video = await this.videoService.findOne(id);

        // Проверка прав доступа (например, из JWT) может быть здесь
        // if (!user.hasAccess) throw new ForbiddenException();

        // Отправляем секретный заголовок для Nginx
        // /protected_videos/ — это внутренний alias в конфиге Nginx
        res.set({
            'X-Accel-Redirect': `/protected_videos/${video.videoUrl}`,
            'Content-Type': 'video/mp4',
        });
        return res.end();
    }

    // 3. CRUD: Получить список
    @Get()
    async getAll() {
        return this.videoService.findAll();
    }

    // 4. CRUD: Удалить
    @Delete(':id')
    async remove(@Param('id') id: string) {
        return this.videoService.delete(id);
    }
}