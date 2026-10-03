import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
  Optional,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);
  private pool?: pg.Pool;

  constructor(@Optional() configService?: ConfigService) {
    const connectionString =
      configService?.get<string>('DATABASE_URL') ||
      process.env.DATABASE_URL ||
      'postgresql://postgres:postgres@localhost:5432/postgres';

    const pool = new pg.Pool({ connectionString });
    const adapter = new PrismaPg(pool);

    super({ adapter });
    this.pool = pool;
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Conexión establecida con Supabase PostgreSQL mediante Prisma');
    } catch (error) {
      this.logger.warn(
        `Advertencia al conectar con la base de datos: ${(error as Error).message}`,
      );
    }
  }

  async onModuleDestroy() {
    try {
      await this.$disconnect();
      if (this.pool) {
        await this.pool.end();
      }
      this.logger.log('Conexión con Supabase cerrada correctamente');
    } catch (error) {
      this.logger.error('Error al cerrar la conexión de base de datos:', error);
    }
  }
}
