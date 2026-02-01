export class User {
  id: string; // В домене лучше использовать string, который в Mongo станет ObjectId
  name: string;
  surname: string;
  email: string;
  password?: string;
  role: string;
  phone?: string;
  avatar?: string;
  telegramId?: number;
  telegramUsername?: string;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
  }

  // Здесь можно добавить бизнес-логику (методы)
  getFullName() {
    return `${this.name} ${this.surname}`;
  }
}