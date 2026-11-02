import { Module } from '@nestjs/common';
import { PlanService } from './plan.service.js';

@Module({
  providers: [PlanService]
})
export class PlanModule {}
