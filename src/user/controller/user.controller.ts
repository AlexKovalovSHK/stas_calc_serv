
import {Body, Controller, Delete, Get, Param, Post, Put, Query, UploadedFiles, UseGuards, UseInterceptors} from "@nestjs/common";
import {HydratedDocument, ObjectId} from "mongoose";
import {FileFieldsInterceptor} from "@nestjs/platform-express";
import { UserService } from "../service/user.service";
import { CreateUserDto } from "../dto/new-user.dto";
import { UpdateUserDto } from "../dto/update-user.dto";
import { User } from "../shema/user.shema";


@Controller('api/v1/users')
export class UserController {
    constructor(private userService: UserService) {    }

    /*@Post()
    create( @Body() dto: CreateUserDto) {
        return this.userService.create(dto);
    }*/
    @Get()
    getAll(@Query('count') count: number,
           @Query('offset') offset: number) {
        return this.userService.getAll(count, offset)
    }

    @Get(':id')
    getOne(@Param('id') id: string) {
        return this.userService.getOne(id);
    }

    @Delete(':id')
    delete(@Param('id') id: string) {
        return this.userService.delete(id);
    }

    @Put()
    updateUser(@Body() dto: UpdateUserDto): Promise<HydratedDocument<User>> {
        return this.userService.updateUser(dto);
    }

}
