import { Module } from '@nestjs/common';
import { PorterService } from './porter.service.js';
import { PorterController } from './porter.controller.js';

@Module({
  controllers: [PorterController],
  providers: [PorterService],
  exports: [PorterService],
})
export class PorterModule {}
