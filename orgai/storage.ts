import { existsSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { Meeting, type MeetingPayload } from './meeting.ts';

const STATE_FILE = '.orgai_session.json';

export function saveSession(meeting: Meeting | null): void {
  if (meeting === null) {
    if (existsSync(STATE_FILE)) {
      unlinkSync(STATE_FILE);
    }
    return;
  }
  writeFileSync(STATE_FILE, JSON.stringify(meeting.toDict(), null, 2), 'utf-8');
}

export function loadSession(): Meeting | null {
  if (!existsSync(STATE_FILE)) {
    return null;
  }
  const payload = JSON.parse(readFileSync(STATE_FILE, 'utf-8')) as MeetingPayload;
  return Meeting.fromDict(payload);
}
