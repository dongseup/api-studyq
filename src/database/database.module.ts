import { Module, Global } from '@nestjs/common';
import mysql from 'mysql2/promise';
import { ConfigService } from '@nestjs/config';

@Global()
@Module({
  providers: [
    {
      provide: 'DATABASE_CONNECTION',
      useFactory: async (configService: ConfigService) => {
        const url = configService.get<string>('DATABASE_URL');
        if (!url) {
          throw new Error('DATABASE_URL environment variable is not defined');
        }

        try {
          const dbUrl = new URL(url);
          console.log('Connecting to database:', {
            host: dbUrl.hostname,
            port: dbUrl.port,
            user: dbUrl.username,
            database: dbUrl.pathname.slice(1),
          });

          return mysql.createPool({
            host: dbUrl.hostname,
            port: Number(dbUrl.port) || 3306,
            user: dbUrl.username,
            password: dbUrl.password, // Use raw password string from URL parsing
            database: dbUrl.pathname.slice(1),
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0,
          });
        } catch (error) {

          console.error('Error parsing DATABASE_URL:', error);
          throw error;
        }
      },
      inject: [ConfigService],
    },
  ],
  exports: ['DATABASE_CONNECTION'],
})
export class DatabaseModule {}
