import { Module, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DatabaseMigrationService {
  constructor(private configService: ConfigService) {}

  async runMigrations() {
    console.log('🔄 Skipping migrations (run manually if needed)');
  }

  async seedDatabase() {
    console.log('🌱 Skipping seeds (run manually if needed)');
  }
}

@Module({
  providers: [DatabaseMigrationService],
  exports: [DatabaseMigrationService],
})
export class DatabaseModule {}
