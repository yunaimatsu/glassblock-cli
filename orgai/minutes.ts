export interface MinutesPayload {
  summary?: string;
  discussion?: string[];
  decisions?: string[];
  decision_candidates?: string[];
  open_questions?: string[];
  action_items?: string[];
  action_item_candidates?: string[];
  parking_lot?: string[];
  current_focus?: string;
}

export class Minutes {
  summary = '';
  discussion: string[] = [];
  decisions: string[] = [];
  decisionCandidates: string[] = [];
  openQuestions: string[] = [];
  actionItems: string[] = [];
  actionItemCandidates: string[] = [];
  parkingLot: string[] = [];
  currentFocus = '';

  addDiscussion(text: string): void {
    const value = text.trim();
    if (value) this.discussion.push(value);
  }

  addParkingLot(text: string): void {
    const value = text.trim();
    if (value) this.parkingLot.push(value);
  }

  setFocus(text: string): void {
    this.currentFocus = text.trim();
  }

  addDecisionCandidate(text: string): void {
    const value = text.trim();
    if (value) this.decisionCandidates.push(value);
  }

  addActionItemCandidate(text: string): void {
    const value = text.trim();
    if (value) this.actionItemCandidates.push(value);
  }

  addNote(text: string): void {
    this.addDiscussion(`NOTE: ${text.trim()}`);
  }

  finalize(): void {
    if (this.decisions.length === 0 && this.decisionCandidates.length > 0) {
      this.decisions.push(...this.decisionCandidates);
    }
    if (this.actionItems.length === 0 && this.actionItemCandidates.length > 0) {
      this.actionItems.push(...this.actionItemCandidates);
    }
    if (this.decisions.length === 0) {
      this.openQuestions.push('No final decision recorded; follow-up required.');
    }
    if (this.actionItems.length === 0) {
      this.actionItems.push('Owner TBD: schedule follow-up to assign concrete tasks.');
    }
    if (!this.summary && this.discussion.length > 0) {
      const preview = this.discussion.slice(0, 2).join(' ');
      this.summary = preview.slice(0, 280);
    }
  }

  toDict(): Record<string, unknown> {
    return {
      summary: this.summary,
      discussion: this.discussion,
      decisions: this.decisions,
      decision_candidates: this.decisionCandidates,
      open_questions: this.openQuestions,
      action_items: this.actionItems,
      action_item_candidates: this.actionItemCandidates,
      parking_lot: this.parkingLot,
      current_focus: this.currentFocus,
    };
  }

  static fromDict(payload: MinutesPayload): Minutes {
    const minutes = new Minutes();
    minutes.summary = payload.summary ?? '';
    minutes.discussion = [...(payload.discussion ?? [])];
    minutes.decisions = [...(payload.decisions ?? [])];
    minutes.decisionCandidates = [...(payload.decision_candidates ?? [])];
    minutes.openQuestions = [...(payload.open_questions ?? [])];
    minutes.actionItems = [...(payload.action_items ?? [])];
    minutes.actionItemCandidates = [...(payload.action_item_candidates ?? [])];
    minutes.parkingLot = [...(payload.parking_lot ?? [])];
    minutes.currentFocus = payload.current_focus ?? '';
    return minutes;
  }
}

export function utcNowIso(): string {
  return new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
}
