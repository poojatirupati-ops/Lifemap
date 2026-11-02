import { Module } from '@nestjs/common';
import { EVENT_BUS, eventBus } from './bus';

@Module({
  // EVENT_BUS picks the adapter: eventbridge (production) or memory (dev and tests); see bus.ts.
  providers: [{ provide: EVENT_BUS, useFactory: () => eventBus() }],
  exports: [EVENT_BUS],
})
export class EventsModule {}
