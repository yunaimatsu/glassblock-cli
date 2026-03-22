import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { Minutes, utcNowIso, type MinutesPayload } from './minutes.ts';

export enum MeetingState {
  IDLE = 'IDLE',
  RUNNING = 'RUNNING',
  CLOSING = 'CLOSING',
  DONE = 'DONE',
}

export interface MeetingPayload {
  id: string;
  topic: string;
  state: MeetingState;
  branch: string;
  started_from_branch: string;
  minutes: MinutesPayload;
  created_at?: string;
}

export class Meeting {
  constructor(
    public id: string,
    public topic: string,
    public state: MeetingState,
    public branch: string,
    public startedFromBranch: string,
    public minutes: Minutes,
    public createdAt: string,
  ) {}

  static start(topic: string, startedFromBranch: string): Meeting {
    const date = new Date().toISOString().slice(0, 10);
    const slug = slugify(topic);
    const branch = `mtg/${date}-${slug}`;
    const trimmedTopic = topic.trim();
    return new Meeting(
      randomUUID(),
      trimmedTopic,
      MeetingState.RUNNING,
      branch,
      startedFromBranch,
      Object.assign(new Minutes(), { currentFocus: trimmedTopic }),
      utcNowIso(),
    );
  }

  toDict(): Record<string, unknown> {
    return {
      id: this.id,
      topic: this.topic,
      state: this.state,
      branch: this.branch,
      started_from_branch: this.startedFromBranch,
      minutes: this.minutes.toDict(),
      created_at: this.createdAt,
    };
  }

  static fromDict(payload: MeetingPayload): Meeting {
    return new Meeting(
      payload.id,
      payload.topic,
      payload.state,
      payload.branch,
      payload.started_from_branch,
      Minutes.fromDict(payload.minutes),
      payload.created_at ?? utcNowIso(),
    );
  }

  finalizeToMarkdown(): string {
    this.minutes.finalize();
    const date = new Date().toISOString().slice(0, 10);
    const timestamp = utcNowIso();

    const yaml = [
      '---',
      `title: ${this.topic}`,
      `meeting_name: ${this.topic}`,
      `topic: ${this.topic}`,
      `date: ${date}`,
      `timestamp: ${timestamp}`,
      'tool: orgai',
      'meeting_type: general',
      'participants: [user, orgai]',
      `objective: Discuss ${this.topic}`,
      'constraints: []',
      `started_from_branch: ${this.startedFromBranch}`,
      `branch: ${this.branch}`,
      'status: done',
      '---',
      '',
    ].join('\n');

    const section = (title: string, items: string[]) =>
      `# ${title}\n${items.length ? items.map((i) => `- ${i}`).join('\n') : '- None'}\n`;

    return (
      yaml +
      section('Discussion', this.minutes.discussion) +
      '\n' +
      section('Decisions', this.minutes.decisions) +
      '\n' +
      section('Open Questions', this.minutes.openQuestions) +
      '\n' +
      section('Action Items', this.minutes.actionItems) +
      '\n' +
      section('Parking Lot', this.minutes.parkingLot)
    );
  }

  minutesFilename(): string {
    const date = new Date().toISOString().slice(0, 10);
    const slug = slugify(this.topic);
    return path.join('docs', 'minutes', `${date}-${slug}-orgai.md`);
  }
}

export function slugify(text: string): string {
  const compact = text.trim().toLowerCase().split(/\s+/).join('-');
  const keep = [...compact].filter((c) => /[a-z0-9-]/.test(c));
  return keep.join('').slice(0, 60) || 'meeting';
}
