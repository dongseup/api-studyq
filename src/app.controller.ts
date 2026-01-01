import { Controller, Get, Inject } from '@nestjs/common';
import type { Pool } from 'mysql2/promise';
import { AppService } from './app.service';


@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    @Inject('DATABASE_CONNECTION') private readonly db: Pool,

  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('db')
  async getDbTest() {
    try {
      const [rows] = await this.db.query('SELECT 1 as result');
      return {
        status: 'success',
        result: rows,
      };
    } catch (e) {
      return {
        status: 'error',
        message: e instanceof Error ? e.message : String(e),
        code: (e as any).code,
        errno: (e as any).errno,
        sqlState: (e as any).sqlState,
        stack: e instanceof Error ? e.stack : undefined,
      };
    }
  }


}
