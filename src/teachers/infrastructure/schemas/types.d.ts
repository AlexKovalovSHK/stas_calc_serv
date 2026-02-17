import { TeacherSchema } from './teacher.schema';

declare global {
  namespace Express {
    export interface Teacher extends TeacherSchema {}
  }
}
