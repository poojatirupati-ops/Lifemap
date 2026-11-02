import { Module } from '@nestjs/common';
import { EventsModule } from '../events/events.module';
import { AdvisersService } from './advisers.service';
import { BookingsService } from './bookings.service';
import { CalService } from './cal.service';

@Module({
  imports: [EventsModule],
  providers: [BookingsService, AdvisersService, CalService],
})
export class BookingsModule {}
