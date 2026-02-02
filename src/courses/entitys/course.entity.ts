export class Course {
    id: string;
    title: string;
    slug: string;
    description: string;
    priceAmount: number;
    priceCurrency: string;
    authorId: string;
    note: string;
    image: string;
    status: string;
    modules: string[];
    createdAt: Date;
    updatedAt: Date;

    constructor(partial: Partial<Course>) {
        Object.assign(this, partial);
    }

    // Доменные методы
    publish(): void {
        this.status = 'PUBLISHED';
    }

    archive(): void {
        this.status = 'ARCHIVED';
    }

    isPublished(): boolean {
        return this.status === 'PUBLISHED';
    }

    addModule(moduleId: string): void {
        if (!this.modules.includes(moduleId)) {
            this.modules.push(moduleId);
        }
    }

    removeModule(moduleId: string): void {
        this.modules = this.modules.filter(id => id !== moduleId);
    }
}