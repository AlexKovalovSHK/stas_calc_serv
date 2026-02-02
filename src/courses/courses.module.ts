import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CourseMongoModel, CourseSchema } from './models/shemas/course.shema';
import { ModuleMongoModel, ModuleSchema } from './models/shemas/module.shema';
import { CourseMapper } from './infrastructure/mappers/course.mapper';
import { ModuleMapper } from './infrastructure/mappers/module.mapper'; // ← добавляем
import { CoursesService } from './services/courses.service';
import { ModulesController } from './controllers/modules.controller';
import { CoursesController } from './controllers/courses.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CourseMongoModel.name, schema: CourseSchema },
      { name: ModuleMongoModel.name, schema: ModuleSchema },
    ]),
  ],
  controllers: [CoursesController, ModulesController],
  providers: [
    CoursesService,
    CourseMapper,
    ModuleMapper,
  ],
  exports: [CoursesService],
})
export class CoursesModule {}