import { NewTeacherDto, TeacherDto, UpdateTeacherDto } from "./dtos/teacher.dto";


export interface ITeacherService {
    createNewTeacher(dto: NewTeacherDto): Promise<TeacherDto>
    getAllTeachers(): Promise<TeacherDto[]>
    getTeacherById(id: string): Promise<TeacherDto>
    updateTeacher(dto: UpdateTeacherDto): Promise<TeacherDto>
    deleteTeacher(id: string): Promise<boolean>
}