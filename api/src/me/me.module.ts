import { Module } from '@nestjs/common';
import { MeService } from './me.service.js';

@Module({
  providers: [MeService]
})
export class MeModule {}
