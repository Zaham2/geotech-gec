import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';

// Modules
import { DatabaseModule } from './common/database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { CalculationsModule } from './modules/calculations/calculations.module';
import { ChatModule } from './modules/chat/chat.module';
import { ReportsModule } from './modules/reports/reports.module';
import { OpenaiModule } from './modules/openai/openai.module';
import { HealthModule } from './modules/health/health.module';
import { ChatController } from './modules/chat/chat.controller';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    
    // Rate limiting
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute
      },
    ]),

    // Core modules
    DatabaseModule,
    HealthModule,
    OpenaiModule,

    // Feature modules
    AuthModule,
    UsersModule,
    ProjectsModule,
    CalculationsModule,
    ChatModule,
    ReportsModule,
  ],
  controllers: [ChatController],
})
export class AppModule {} 