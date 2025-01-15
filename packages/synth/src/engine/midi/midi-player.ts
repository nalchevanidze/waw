import { MidiStep, NoteAction, NOTE_ACTION, Sequence } from './types';
import { keysToIndexes } from '../../utils/notes';
import { Sequencer } from './sequencer';
import { Tempo } from './tempo';
import { SAMPLE_RATE } from '../oscillator/utils';
import { Midi } from '../../core/types';

export type MidiState = {
  isPlaying: boolean;
  time: number;
  notes: number[];
};

export type MidiCallback = (s: MidiState) => void;

const taskAt = (midi: NoteAction[], i: number, key: NOTE_ACTION): number[] => {
  const step = (midi[i] = midi[i] ?? {});

  switch (key) {
    case NOTE_ACTION.START: {
      const start = step.start ?? [];
      step.start = start;
      return start;
    }
    case NOTE_ACTION.END: {
      const end = step.end ?? [];
      step.end = end;
      return end;
    }
  }
};

export const toActions = (input: Midi): NoteAction[] => {
  const output: NoteAction[] = Array(input.size).fill(undefined);

  Object.entries(input.notes).forEach(([i, quarter]) => {
    quarter.forEach((note) => {
      const start = parseInt(i, 10) * 8 + note.at;
      const end = start + note.length - 1;
      const key = keysToIndexes(note.id);

      taskAt(output, start, NOTE_ACTION.START).push(key);
      taskAt(output, end, NOTE_ACTION.END).push(key);
    });
  });

  return output;
};

class MidiPlayer {
  private current = 0;
  private tempo = new Tempo(SAMPLE_RATE);
  public notes: Set<number> = new Set([]);
  onChange: MidiCallback;

  constructor(private sequencer: Sequencer) {}

  public isPlaying = false;

  private refresh() {
    requestAnimationFrame(() =>
      this.onChange({
        isPlaying: this.isPlaying,
        time: this.current,
        notes: Array.from(this.notes)
      })
    );
  }

  public next = (actions: NoteAction[], seq: Sequence): MidiStep => {
    const notes = this.notes;
    if (!this.tempo.next()) {
      return { notes };
    }

    const keyNotes = this.isPlaying ? actions[this.current] : undefined;

    keyNotes?.start?.forEach((n) => this.note(true, n));
    keyNotes?.end?.forEach((n) => this.note(false, n));

    if (this.isPlaying) {
      this.current = (this.current + 1) % actions.length;
    }

    const keyboard = this.sequencer.next(seq, notes) ?? keyNotes;

    return {
      start: keyboard?.start,
      end: keyboard?.end,
      notes,
      current: this.isPlaying ? this.current : undefined
    };
  };

  public setTime = (time: number) => {
    this.current = time;
    this.onChange({
      isPlaying: this.isPlaying,
      time,
      notes: Array.from(this.notes)
    });
  };

  public play = (): void => {
    this.isPlaying = true;
  };

  public clear = () => {
    this.notes.clear();
  };

  private note = (start: boolean, note: number) => {
    const { notes } = this;

    if (start) {
      if (!notes.has(note)) {
        this.sequencer.restart();
      }
      notes.add(note);
    } else {
      this.notes.delete(note);
    }
  };

  public startNote = (seq: Sequence, note: number): MidiStep => {
    const { notes, current } = this;
    const start = seq.enabled ? undefined : [note];

    this.note(true, note);
    this.refresh();
    return { notes, current, start };
  };

  public endNote = (seq: Sequence, note: number): MidiStep => {
    const { notes, current } = this;
    const end = seq.enabled ? undefined : [note];

    this.note(false, note);
    this.refresh();
    return { notes, current, end };
  };

  stop() {
    const time = 0;
    this.current = time;
    this.onChange({
      isPlaying: false,
      time: time,
      notes: []
    });
  }
}

export { MidiPlayer };
