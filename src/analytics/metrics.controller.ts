import { Controller, Post, Body, Req, Ip, Headers, Get } from '@nestjs/common';
import { Request } from 'express';
import { UAParser } from 'ua-parser-js';
import * as geoip from 'geoip-lite';
import { MetricsService } from './metrics.service';

@Controller('metrics')
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) { }

  /**
   * Эндпоинт для фиксации захода на страницу (Page View)
   */
  @Post('page-view')
  async logPageView(
    @Body() data: any,
    @Ip() ip: string,
    @Req() req: Request
  ) {
    const userAgentString = req.headers['user-agent'] || '';
    const parser = new UAParser(userAgentString);
    const uaResult = parser.getResult();

    // Пробуем найти город по IP, если это не localhost
    const realIp = (req.headers['x-forwarded-for'] as string) || ip;
    const geo = geoip.lookup(realIp === '::1' ? '8.8.8.8' : realIp);

    const metricsRecord = {
      sessionId: data.sessionId,
      url: data.url,
      // Если фронтенд прислал таймзону - берем её, иначе из GeoIP
      timezone: data.timezone || geo?.timezone || 'unknown',
      country: geo?.country || 'unknown',
      city: geo?.city || 'unknown',
      browser: uaResult.browser.name || 'unknown',
      os: uaResult.os.name || 'unknown',
      device: uaResult.device.type || 'desktop',
    };

    await this.metricsService.logPageView(metricsRecord);

    console.log('New visit saved to DB:', metricsRecord);
    return { status: 'ok' };
  }

  /**
   * Эндпоинт для обновления времени пребывания на странице
   * Вызывается из React при уходе со страницы через navigator.sendBeacon
   */
  @Post('duration')
  async logDuration(@Body() data: any) {
    if (!data || !data.sessionId) {
      // Если данных нет, просто игнорируем, чтобы сервер не падал
      return { status: 'no data' };
    }

    await this.metricsService.logDuration({
      sessionId: data.sessionId,
      url: data.url,
      durationSeconds: data.durationSeconds,
    });

    console.log(`--- Уход со страницы (сохранено в DB) ---`);
    console.log(`Сессия: ${data.sessionId}, Время: ${data.durationSeconds} сек, URL: ${data.url}`);

    return { status: 'ok' };
  }

  @Get('stats/summary')
  async getSummary() {
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);

    return this.metricsService.getSummaryStats(last30Days, new Date());
  }

  @Get('stats/pages')
  async getTopPages() {
    return this.metricsService.getPopularPages();
  }

}