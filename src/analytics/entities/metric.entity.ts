import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('metrics')
export class MetricEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    sessionId: string;

    @Column()
    url: string;

    @Column({ default: 'unknown' })
    timezone: string;

    @Column({ default: 'unknown' })
    country: string;

    @Column({ default: 'unknown' })
    city: string;

    @Column({ default: 'unknown' })
    browser: string;

    @Column({ default: 'unknown' })
    os: string;

    @Column({ default: 'desktop' })
    device: string;

    @Column({ type: 'integer', default: 0 })
    durationSeconds: number;

    @CreateDateColumn()
    createdAt: Date;
}
