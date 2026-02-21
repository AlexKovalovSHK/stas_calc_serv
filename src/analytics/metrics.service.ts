import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual, Between } from 'typeorm';
import { MetricEntity } from './entities/metric.entity';

@Injectable()
export class MetricsService {
    constructor(
        @InjectRepository(MetricEntity)
        private metricRepository: Repository<MetricEntity>,
    ) { }

    /**
     * Сохраняет данные о просмотре страницы
     */
    async logPageView(data: {
        sessionId: string;
        url: string;
        timezone: string;
        country: string;
        city: string;
        browser: string;
        os: string;
        device: string;
    }) {
        const duplicateWindow = new Date(Date.now() - 5000);

        // 2. Проверяем, существует ли уже такая запись
        const isDuplicate = await this.metricRepository.findOne({
            where: {
                sessionId: data.sessionId,
                url: data.url,
                createdAt: MoreThanOrEqual(duplicateWindow),
            },
        });

        // 3. Если запись найдена — просто выходим из метода, ничего не сохраняя
        if (isDuplicate) {
            console.log(`[Metrics] Duplicate detected for session ${data.sessionId} on URL ${data.url}. Skipping...`);
            return null;
        }

        // 4. Если дубликатов нет — сохраняем
        const newMetric = this.metricRepository.create({
            ...data,
            createdAt: new Date()
        });
        return await this.metricRepository.save(newMetric);
    }

    /**
     * Обновляет время пребывания на странице
     */
    async logDuration(data: {
        sessionId: string;
        url: string;
        durationSeconds: number;
    }) {
        // Ищем последнюю запись с таким sessionId и url, чтобы обновить время
        const latestMetric = await this.metricRepository.findOne({
            where: { sessionId: data.sessionId, url: data.url },
            order: { createdAt: 'DESC' },
        });

        if (latestMetric) {
            latestMetric.durationSeconds = data.durationSeconds;
            return await this.metricRepository.save(latestMetric);
        }

        return null;
    }

    async getSummaryStats(startDate: Date, endDate: Date) {
        const stats = await this.metricRepository
            .createQueryBuilder('metric')
            .select('COUNT(*)', 'totalViews')
            .addSelect('COUNT(DISTINCT(sessionId))', 'uniqueVisitorsCount')
            .addSelect('AVG(durationSeconds)', 'avgDuration')
            .where('metric.createdAt BETWEEN :start AND :end', { start: startDate, end: endDate })
            .getRawOne();

        return {
            totalViews: parseInt(stats.totalViews || '0'),
            uniqueVisitorsCount: parseInt(stats.uniqueVisitorsCount || '0'),
            avgDuration: Math.round(parseFloat(stats.avgDuration || '0'))
        };
    }

    async getPopularPages() {
        const pages = await this.metricRepository
            .createQueryBuilder('metric')
            .select('url', 'id')
            .addSelect('COUNT(*)', 'count')
            .addSelect('AVG(durationSeconds)', 'avgTime')
            .groupBy('url')
            .orderBy('count', 'DESC')
            .limit(10)
            .getRawMany();

        return pages.map(p => ({
            _id: p.id,
            count: parseInt(p.count),
            avgTime: parseFloat(p.avgTime || '0')
        }));
    }
}