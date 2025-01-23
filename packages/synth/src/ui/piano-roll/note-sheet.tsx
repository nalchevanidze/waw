import * as React from 'react';
import { Timeline } from './timeline';
import { Notes } from './notes';
import {
  insertNoteAt,
  flatten,
  deepen,
  Selected,
  selectNotesIn,
  KEYBOARD_WIDTH,
  editNotes,
  STAGE_WIDTH,
  STAGE_HEIGHT
} from './utils';
import { Background } from './background';
import { StageContext, SvgStage, Point } from '@wdaw/svg';
import { MouseEventHandler, useContext, useState } from 'react';
import { EditActionType, Maybe, NotePoint, SelectZone } from '../types';
import { ConfiguratorContext } from '../configurator';
import { useKeyAction } from '../utils';
import { NOTE_SIZE, TIMELINE_HEIGHT } from '../common/defs';
import { MODE, useDragging } from '../hooks/useDragging';
import { useNotes } from '../hooks/useNotes';

const viewBox = [
  -KEYBOARD_WIDTH,
  -TIMELINE_HEIGHT,
  STAGE_WIDTH,
  STAGE_HEIGHT
].join(' ');

const SelectionCover: React.FC<SelectZone> = ([start, end]) => (
  <rect
    stroke="red"
    fill="red"
    fillOpacity={0.1}
    x={Math.min(start.x, end.x)}
    y={Math.min(start.y, end.y)}
    width={Math.abs(end.x - start.x)}
    height={Math.abs(end.y - start.y)}
  />
);

type Props = {
  actionType: EditActionType;
};

const NoteSheet: React.FC<Props> = ({ actionType }) => {
  const [
    {
      player: { time },
      tracks: { currentTrack, tracks }
    }
  ] = useContext(ConfiguratorContext);
  const getCoordinates = React.useContext(StageContext);

  const [selectionArea, setSelectionArea] = useState<SelectZone | undefined>();
  const { mode, dragging, startDraggingE, endDraggingE } = useDragging();
  const { notes, updateNotes } = useNotes();

  const allNotes = [...notes.selected, ...notes.inactive];

  const onMouseMove: MouseEventHandler<SVGGElement> = (e) => {
    const point = getCoordinates(e);
    const { selected, inactive } = notes;

    switch (mode) {
      case 'SELECT': {
        const area = dragging ? ([dragging, point] as const) : undefined;
        setSelectionArea(area);
        return updateNotes(selectNotesIn(notes, area));
      }
      case 'MOVE':
      case 'SCALE': {
        return dragging
          ? updateNotes({
              selected: editNotes(mode, selected, dragging, point),
              inactive
            })
          : undefined;
      }
    }
  };

  const handleEventEnd = (): void => {
    if (mode && ['MOVE', 'RESIZE'].includes(mode)) {
      updateNotes({
        selected: [],
        inactive: allNotes.map(({ old, ...n }) => n)
      });
    }
    setSelectionArea(undefined);
    endDraggingE();
  };

  const clickOnBackground: MouseEventHandler<SVGGElement> = (e) => {
    switch (actionType) {
      case 'draw': {
        return startDragging(
          'SCALE',
          e,
          insertNoteAt(notes, getCoordinates(e))
        );
      }
      case 'select':
        return startDragging('SELECT', e, { selected: [], inactive: allNotes });
    }
  };

  const clickOnNote = (
    e: React.MouseEvent<SVGGElement, MouseEvent>,
    note: NotePoint
  ): void => {
    switch (actionType) {
      case 'draw': {
        return updateNotes({
          selected: [],
          inactive: allNotes.filter((arrayNote) => arrayNote !== note)
        });
      }
      case 'select': {
        return startDragging('MOVE', e, {
          selected: [note],
          inactive: allNotes.filter((e) => e !== note)
        });
      }
    }
  };

  const startDragging = (
    name: MODE,
    e: React.MouseEvent<SVGGElement, MouseEvent>,
    ns?: Selected<NotePoint>
  ) => {
    startDraggingE(name, e);

    const { selected, inactive } = ns ?? notes;
    updateNotes({
      selected: selected.map((note) => ({ ...note, old: { ...note } })),
      inactive
    });
  };

  const deleteNotes = () => (e: KeyboardEvent) => {
    switch (e.key) {
      case 'Backspace': {
        return updateNotes({ selected: [], inactive: notes.inactive });
      }
    }
  };

  useKeyAction(deleteNotes, [notes]);

  const track = tracks[currentTrack].midi;

  const loopSize = (track.loop[1] - track.loop[0]) * 8;

  const current =
    time < track.start * 8 ? 0 : track.loop[0] * 8 + (time % loopSize);

  return (
    <g
      onMouseMove={onMouseMove}
      onMouseLeave={handleEventEnd}
      onMouseUp={handleEventEnd}
    >
      <Background
        onMouseDown={clickOnBackground}
        loop={tracks[currentTrack].midi.loop}
      />
      <g>
        <Notes notes={notes.inactive} mouseDown={clickOnNote} />
        <Notes
          notes={notes.selected}
          color="#03A9F4"
          mouseDown={(e) => startDragging('MOVE', e)}
          resize={(e) => startDragging('SCALE', e)}
        />
      </g>
      <Timeline time={(current * NOTE_SIZE) / 2} height={STAGE_HEIGHT} />
      {selectionArea ? <SelectionCover {...selectionArea} /> : null}
    </g>
  );
};

const PianoRoll: React.FC<Props> = (props) => (
  <SvgStage
    viewBox={viewBox}
    width={STAGE_WIDTH + 'px'}
    height={STAGE_HEIGHT + 'px'}
    style={{
      background: '#FFF'
    }}
  >
    <NoteSheet {...props} />
  </SvgStage>
);

export default PianoRoll;
