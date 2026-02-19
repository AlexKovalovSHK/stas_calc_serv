import { HttpService } from '@nestjs/axios';
import { Controller, Get, Query, Res } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';

@Controller('/api')
export class AppController {
  constructor(
    private readonly httpService: HttpService, // Инъекция HTTP сервиса
  ) { }

  @Get('health')
  getHealth() {
    return {
      status: 'OK',
      timestamp: new Date().toISOString(),
      service: 'IFOB SCOOL'
    };
  }

  @Get('songs-proxy')
  async getSongs(
    @Query('page') page: string = '0',
    @Query('size') size: string = '100'
  ) {
    // Делаем запрос от сервера к серверу
    const url = `https://api.noav.eu/api/song/search?page=${page}&size=${size}`;

    try {
      // firstValueFrom превращает Observable в Promise
      const { data } = await firstValueFrom(this.httpService.get(url));

      // Возвращаем данные фронтенду
      return data;
    } catch (error) {
      // Обработка ошибок
      return { error: 'Failed to fetch data from remote API', details: error.message };
    }
  }

  @Get('songs-find')
  async findSongs(
    @Query('name') name: string,
    @Query('page') page: string = '0',
    @Query('size') size: string = '50'
  ) {
    const encodedName = encodeURIComponent(name);
    const url = `https://api.noav.eu/api/song/find?name=${encodedName}&page=${page}&size=${size}`;

    try {
      const { data } = await firstValueFrom(this.httpService.get(url));
      return data;
    } catch (error) {
      return { error: 'Search failed', details: error.message };
    }
  }

}