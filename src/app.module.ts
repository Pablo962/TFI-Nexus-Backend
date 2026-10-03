import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { EmployeesModule } from './modules/employees/employees.module.js';
import { JobsModule } from './modules/jobs/jobs.module.js';
import { RecruitmentModule } from './modules/recruitment/recruitment.module.js';
import { EvaluationsModule } from './modules/evaluations/evaluations.module.js';
import { TrainingModule } from './modules/training/training.module.js';
import { PorterModule } from './modules/porter/porter.module.js';
import { ReportsModule } from './modules/reports/reports.module.js';
import { ExportModule } from './modules/export/export.module.js';
import { PrismaModule } from './prisma/prisma.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    ExportModule,
    AuthModule,
    EmployeesModule,
    JobsModule,
    RecruitmentModule,
    EvaluationsModule,
    TrainingModule,
    PorterModule,
    ReportsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
