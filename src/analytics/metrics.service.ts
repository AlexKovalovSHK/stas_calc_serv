import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
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
        referrer?: string;
        utmSource?: string;
        utmMedium?: string;
        utmCampaign?: string;
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

    async getDetailedStats() {
        const countries = await this.metricRepository
            .createQueryBuilder('metric')
            .select('country', 'name')
            .addSelect('COUNT(DISTINCT(sessionId))', 'value')
            .groupBy('country')
            .orderBy('value', 'DESC')
            .limit(10)
            .getRawMany();

        const devices = await this.metricRepository
            .createQueryBuilder('metric')
            .select('device', 'name')
            .addSelect('COUNT(*)', 'value')
            .groupBy('device')
            .getRawMany();

        const browsers = await this.metricRepository
            .createQueryBuilder('metric')
            .select('browser', 'name')
            .addSelect('COUNT(*)', 'value')
            .groupBy('browser')
            .orderBy('value', 'DESC')
            .limit(5)
            .getRawMany();

        const referrers = await this.metricRepository
            .createQueryBuilder('metric')
            .select('referrer', 'name')
            .addSelect('COUNT(*)', 'value')
            .where('referrer IS NOT NULL AND referrer != ""')
            .groupBy('referrer')
            .orderBy('value', 'DESC')
            .limit(10)
            .getRawMany();

        const utmSources = await this.metricRepository
            .createQueryBuilder('metric')
            .select('utmSource', 'name')
            .addSelect('COUNT(*)', 'value')
            .where('utmSource IS NOT NULL AND utmSource != ""')
            .groupBy('utmSource')
            .orderBy('value', 'DESC')
            .getRawMany();

        // Engagement metrics: Depth & Bounce Rate
        const depthResult = await this.metricRepository
            .createQueryBuilder('metric')
            .select('AVG(pageCount)', 'avgDepth')
            .from(subQuery => {
                return subQuery
                    .select('sessionId')
                    .addSelect('COUNT(url)', 'pageCount')
                    .from(MetricEntity, 'm')
                    .groupBy('sessionId');
            }, 'sessionStats')
            .getRawOne();

        const totalSessionsResult = await this.metricRepository
            .createQueryBuilder('metric')
            .select('COUNT(DISTINCT(sessionId))', 'count')
            .getRawOne();

        const bounceSessionsResult = await this.metricRepository
            .createQueryBuilder('metric')
            .select('COUNT(*)', 'count')
            .from(subQuery => {
                return subQuery
                    .select('sessionId')
                    .addSelect('COUNT(url)', 'pageCount')
                    .addSelect('SUM(durationSeconds)', 'totalDuration')
                    .from(MetricEntity, 'm')
                    .groupBy('sessionId')
                    .having('pageCount = 1 OR totalDuration < 10');
            }, 'bounces')
            .getRawOne();

        const totalCount = parseInt(totalSessionsResult.count || '0');
        const bounceCount = parseInt(bounceSessionsResult.count || '0');
        const bounceRate = totalCount > 0 ? Math.round((bounceCount / totalCount) * 100) : 0;

        return {
            countries,
            devices,
            browsers,
            referrers,
            utmSources,
            depth: parseFloat(depthResult?.avgDepth || '0').toFixed(2),
            bounceRate: `${bounceRate}%`
        };
    }
}