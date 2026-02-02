export class Module {
    id: string;
    courseId: string;
    title: string;
    description: string;
    topics: string[];
    homework: string;
    image: string;
    author: string;
    rating: number;
    createdAt: Date;
    updatedAt: Date;

    constructor(partial: Partial<Module>) {
        Object.assign(this, partial);
    }

    updateRating(newRating: number): void {
        if (newRating >= 0 && newRating <= 5) {
            this.rating = newRating;
        }
    }

    addTopic(topic: string): void {
        if (!this.topics.includes(topic)) {
            this.topics.push(topic);
        }
    }
}