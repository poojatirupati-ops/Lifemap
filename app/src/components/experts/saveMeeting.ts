// The adviser meeting: a calendar file, or its details as text where only text can be saved.
import { addYears } from 'date-fns/addYears'
import { format } from 'date-fns/format'
import { parse } from 'date-fns/parse'
import { downloads, save } from '../../lib/downloads.ts'
import { localToday } from '../../lib/today.ts'
import { toast } from '../../state/shell.ts'

export interface Meeting {
  adviser: string
  mode: string
  /** "Wed 28 Oct · 10:00" */
  slot: string | null
}

const CALENDAR_TIME = "yyyyMMdd'T'HHmmss"

/** The slot's date and time, in the coming year. */
function meetingStart(slot: string) {
  const today = localToday()
  const start = parse(slot, 'EEE d MMM · HH:mm', today)
  return start < today ? addYears(start, 1) : start
}

function downloadCalendar({ adviser, mode, slot }: Meeting) {
  const start = slot ? meetingStart(slot) : null
  const calendar = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//LifeMap//Prototype//EN',
    'BEGIN:VEVENT',
    `UID:lg-${Date.now()}`,
    `DTSTAMP:${format(new Date(), CALENDAR_TIME)}`,
    ...(start && !Number.isNaN(start.getTime()) ? [`DTSTART:${format(start, CALENDAR_TIME)}`] : []),
    'DURATION:PT45M',
    `SUMMARY:LifeMap meeting with ${adviser}`,
    `DESCRIPTION:${mode} · ${slot}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')
  void save('lifemap-meeting.ics', new Blob([calendar], { type: 'text/calendar' }))
  toast('Calendar file prepared. Check your downloads.')
}

export async function saveMeeting(meeting: Meeting) {
  if (!(await downloads())) return downloadCalendar(meeting)
  const text = `Your LifeMap adviser meeting\r\n\r\nWith: ${meeting.adviser}\r\nWhen: ${meeting.slot}\r\nHow: ${meeting.mode}\r\nLength: 45 minutes\r\n\r\nAdd it to your calendar by hand. Confirmation was sent by email and SMS.\r\nGuidance, not advice.\r\n`
  const saved = await save('LifeMap-meeting.txt', new Blob([text], { type: 'text/plain' }))
  toast(
    saved
      ? 'Meeting details saved as LifeMap-meeting.txt'
      : "We couldn't save the file. Your meeting details are on this screen.",
  )
}
