import { Module, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { exec } from 'child_process';
import { promisify } from 'util';
import { join } from 'path';

const execAsync = promisify(exec);

@Injectable()
export class DatabaseMigrationService {
  private readonly logger = new Logger(DatabaseMigrationService.name);

  constructor(private configService: ConfigService) {}

  async runMigrations() {
    this.logger.log('Running database migrations...');

    const migrateScript = join(__dirname, '../../../../packages/db/dist/migrate.js');
    
    try {
      const { stdout, stderr } = await execAsync(`node ${migrateScript}`, {
        env: { ...process.env },
        timeout: 60_000,
      });
      if (stdout) this.logger.log(stdout.trim());
      if (stderr) this.logger.warn(stderr.trim());
      this.logger.log('Schema migration completed');
    } catch (error: unknown) {
      const execError = error as { stdout?: string; stderr?: string; message?: string };
      this.logger.error('Schema migration failed:', execError.stderr || execError.message);
      throw error;
    }
  }

  async seedDatabase() {
    this.logger.log('Running database seeds...');

    const seedScript = join(__dirname, '../../../../packages/db/dist/seed.js');

    try {
      const { stdout, stderr } = await execAsync(`node ${seedScript}`, {
        env: { ...process.env },
        timeout: 300_000,
      });
      if (stdout) this.logger.log(stdout.trim());
      if (stderr) this.logger.warn(stderr.trim());
      this.logger.log('Seeds completed');
    } catch (error: unknown) {
      const execError = error as { stdout?: string; stderr?: string; message?: string };
      this.logger.error('Seeds failed:', execError.stderr || execError.message);
      throw error;
    }
  }
}

@Module({
  providers: [DatabaseMigrationService],
  exports: [DatabaseMigrationService],
})
export class DatabaseModule {}
