import {
    Controller,
    Get,
    Put,
    Delete,
    Param,
    Body,
    ParseUUIDPipe,
    ValidationPipe,
    UsePipes,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { ModuleResponseDto } from '../dto/module.dto';
import { NewModuleDto } from '../dto/new-module.dto';
import { CoursesService } from '../services/courses.service';

@Controller('modules')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class ModulesController {
    constructor(private readonly coursesService: CoursesService) { }

    @Get()
    async getAllModules(): Promise<ModuleResponseDto[]> {
        return this.coursesService.getModules();
    }

    @Get(':id')
    async getModuleById(
        @Param('id', ParseUUIDPipe) id: string,
    ): Promise<ModuleResponseDto> {
        return this.coursesService.getModuleById(id);
    }

    @Put(':id')
    async updateModule(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updateModuleDto: NewModuleDto,
    ): Promise<ModuleResponseDto> {
        return this.coursesService.updateModule(id, updateModuleDto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async deleteModule(
        @Param('id', ParseUUIDPipe) id: string,
    ): Promise<void> {
        return this.coursesService.deleteModule(id);
    }
}