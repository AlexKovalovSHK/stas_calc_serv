import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TeacherService } from './services/teacher.service';
import { TeacherRepository } from './infrastructure/repositories/teacher.repository';
import { TeacherMapper } from './infrastructure/mappers/teacher.mapper';
import { TeacherController } from './infrastructure/controllers/teacher.controller';
import { TeacherMongooseSchema, TeacherSchema } from './infrastructure/schemas/teacher.schema';

@Module({
    imports: [
      MongooseModule.forFeature([{ name: TeacherSchema.name, schema: TeacherMongooseSchema }]),
    ],
    controllers: [TeacherController],
    providers: [
      TeacherService,
      // Измените это:
      {
        provide: 'ITeacherMapper',
        useClass: TeacherMapper,
      },
      {
        provide: 'ITeacherRepository',
        useClass: TeacherRepository,
      },
    ],
    exports: [TeacherService],
  })
  export class TeacherModule {}
