import { addYears } from 'date-fns/addYears'
import { format } from 'date-fns/format'
import { parse } from 'date-fns/parse'
import { cancelUrl, useActiveBooking, useAdviser, useAdvisers } from '../../bookings/bookings.ts'
import { downloads, hasDownloadsCapability, save } from '../../lib/downloads.ts'
import { localToday } from '../../lib/today.ts'
import { toast } from '../../state/shell.ts'
import { useStore } from '../../state/store.ts'

/** "Wed 28 Oct · 10:00" */
const SLOT = /^(\w+)\s+(\d+)\s+(\w+)/
const CALENDAR_TIME = "yyyyMMdd'T'HHmmss"

interface Meeting {
  adviser: string
  mode: string
  slot: string | null
}

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

/** A calendar file, or inside a shared Claude page (text only) the meeting's details as text. */
async function saveMeeting(meeting: Meeting) {
  if (!(await downloads())) return downloadCalendar(meeting)
  const text = `Your LifeMap adviser meeting\r\n\r\nWith: ${meeting.adviser}\r\nWhen: ${meeting.slot}\r\nHow: ${meeting.mode}\r\nLength: 45 minutes\r\n\r\nAdd it to your calendar by hand. Confirmation was sent by email.\r\nGuidance, not advice.\r\n`
  const saved = await save('LifeMap-meeting.txt', new Blob([text], { type: 'text/plain' }))
  toast(
    saved
      ? 'Meeting details saved as LifeMap-meeting.txt'
      : "We couldn't save the file. Your meeting details are on this screen.",
  )
}

/** The confirmed meeting (as Cal.com confirmed it to the server): date tile, when, how and with whom, a calendar button and cancel (on Cal.com). */
export default function BookedCard() {
  const { slot, mode } = useStore((store) => store.plan.booking) // the confirmed time, kept in step by useBookings
  const saved = useActiveBooking()
  const advisers = useAdvisers()
  const match = useAdviser()
  const adviser = (advisers.find((a) => a.id === saved?.adviserId) ?? match)?.name ?? ''
  const date = SLOT.exec(slot ?? '')
  return (
    <div className="card bk-hero">
      <div className="bk-top">
        <span className="bk-d" aria-hidden="true">
          {date ? (
            <>
              <small>{date[1]}</small>
              <b>{date[2]}</b>
              <small>{date[3]}</small>
            </>
          ) : (
            '📅'
          )}
        </span>
        <div>
          <span className="bk-ok">
            <i aria-hidden="true">✓</i> Confirmed
          </span>
          <b className="bk-when">{slot}</b>
          <span className="bk-who">
            {mode} with {adviser}
          </span>
        </div>
      </div>
      <p className="bk-note">Confirmation sent by email.</p>
      <button className="bk-cal" onClick={() => saveMeeting({ adviser, mode, slot })}>
        {hasDownloadsCapability() ? '📄 Save meeting details' : '📆 Add to my calendar'}
      </button>
      {saved?.calUid ? (
        <a
          className="link"
          href={cancelUrl(saved.calUid)}
          target="_blank"
          rel="noopener noreferrer"
        >
          Cancel this meeting
        </a>
      ) : null}
    </div>
  )
}
