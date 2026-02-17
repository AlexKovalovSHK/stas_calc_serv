import { v4 as uuidv4 } from 'uuid';

export class TeacherId {
  public readonly value: string;

  constructor(value: string) {
    if (!value) {
      throw new Error('TeacherId cannot be empty');
    }
    this.value = value;
  }

  static create(): TeacherId {
    return new TeacherId(uuidv4());
  }

  equals(other: TeacherId): boolean {
    return this.value === other.value;
  }
}

export class Teacher {
  private _id: TeacherId;
  private _name: string;
  private _email: string;
  private _createdAt: Date;
  private _updatedAt: Date;
  private _specialization: string;
  private _bio?: string;

  constructor(
    id: TeacherId,
    name: string,
    email: string,
    createdAt: Date,
    updatedAt: Date,
    specialization: string,
    bio?: string,

  ) {
    this._id = id;
    this._name = name;
    this._email = email;
    this._createdAt = createdAt;
    this._updatedAt = updatedAt;
    this._bio = bio;
    this._specialization = specialization
  }

  get id(): TeacherId {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  get email(): string {
    return this._email;
  }

  get bio(): string | undefined {
    return this._bio;
  }

  get specialization(): string | undefined {
    return this._specialization;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  static create(
    name: string,
    email: string,
    specialization: string,
    bio?: string,

  ): Teacher {
    const now = new Date();
    return new Teacher(TeacherId.create(), name, email, now, now, specialization, bio);
  }

  changeName(name: string): void {
    this._name = name;
    this._updatedAt = new Date();
  }

  changeEmail(email: string): void {
    this._email = email;
    this._updatedAt = new Date();
  }

  changeBio(bio: string): void {
    this._bio = bio;
    this._updatedAt = new Date();
  }

  changeSpecialization(specialization: string): void {
    this._specialization = specialization;
    this._updatedAt = new Date();
  }
}
