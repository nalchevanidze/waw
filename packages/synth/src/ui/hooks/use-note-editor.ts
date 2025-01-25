import * as React from 'react';
import { flatten, deepen, Selected } from '../piano-roll/utils';
import { useContext, useState } from 'react';
import { Area, NotePoint } from '../types';
import { ConfiguratorContext } from '../configurator';
import { selectNotesIn } from '../utils/select-notes';
import { genNoteAt, scaleNotes, moveNotes } from '../utils/edit-notes';
import { Point } from '@wdaw/svg';
import { useOnDelete } from '../utils';

const addOrigin = ({ old, ...note }: NotePoint): NotePoint => ({
  ...note,
  old: { ...note }
});

const dropOrigin = ({ old, ...n }: NotePoint): NotePoint => n;

export const useNoteEditor = () => {
  const [
    {
      tracks: { currentTrack, tracks }
    },
    dispatch
  ] = useContext(ConfiguratorContext);

  const [notes, setNotes] = useState<Selected<NotePoint>>({
    selected: [],
    inactive: flatten(tracks[currentTrack].midi)
  });

  const allNotes = [...notes.selected, ...notes.inactive];

  const dispatchMidi = (ns: Selected<NotePoint>) =>
    dispatch({
      id: currentTrack,
      type: 'SET_MIDI',
      payload: deepen([...ns.selected, ...ns.inactive])
    });

  const update = (ns: Selected<NotePoint>) => setNotes(ns);

  React.useEffect(() => {
    setNotes({
      selected: [],
      inactive: flatten(tracks[currentTrack].midi)
    });
  }, [tracks[currentTrack].midi]);

  const clear = () =>
    update({
      selected: [],
      inactive: allNotes.map(dropOrigin)
    });

  const remove = (note: NotePoint) =>
    update({
      selected: [],
      inactive: allNotes.filter((n) => n !== note).map(dropOrigin)
    });

  const select = (note: NotePoint) =>
    update({
      selected: [note].map(addOrigin),
      inactive: allNotes.filter((n) => n !== note)
    });

  const addAt = (point: Point) =>
    update({
      selected: [genNoteAt(point)].map(addOrigin),
      inactive: allNotes.map(dropOrigin)
    });

  const track = () =>
    update({
      selected: notes.selected.map(addOrigin),
      inactive: notes.inactive
    });

  const selectIn = (area?: Area) => update(selectNotesIn(notes, area));

  const removeSelected = () =>
    update({ selected: [], inactive: notes.inactive });

  const scale = (area: Area) =>
    update({
      selected: scaleNotes(notes.selected, area),
      inactive: notes.inactive
    });

  const move = (area: Area) =>
    update({
      selected: moveNotes(notes.selected, area),
      inactive: notes.inactive
    });

  useOnDelete(removeSelected, [notes.selected, notes.inactive]);

  const sync = () => dispatchMidi(notes);

  return {
    selected: notes.selected,
    inactive: notes.inactive,
    selectIn,
    track,
    clear,
    remove,
    select,
    addAt,
    move,
    scale,
    sync
  };
};
