export class User {
  id: string;
  name: string;
  surname: string;
  email: string;
  password?: string;
  role: string[];
  phone?: string;
  avatar?: string;
  telegramId?: number;
  telegramUsername?: string;
  createdAt?: Date;
  updatedAt?: Date;

  resetCode?: string | null;
  resetCodeExpires?: Date | null;

   academicInfo?: {
    subdivision: string;
    course: number;
    sessionNumber: string;
    enrollmentDate: Date;
  };

  // Удобный геттер для админки
  isCHSMStudent(): boolean {
    return this.role.includes('Student') && this.academicInfo?.subdivision === 'CHSM';
  }
  
  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
  }

  getFullName() {
    return `${this.name} ${this.surname}`;
  }
}