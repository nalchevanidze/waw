import * as React from 'react';
import { colors } from '../styles';
import { Midi } from '../../engine';
import { NOTE } from '../common/units';
import { UINote } from '../common/notes';
import { flatten } from '../common/midi';

export const STAGE_HEIGHT = 64;

type Props = {
  start: number;
  end: number;
  name: string;
  midi: Midi;
  y: number;
  startMove?(event: React.MouseEvent<SVGGElement, MouseEvent>): void;
  startScale?(event: React.MouseEvent<SVGGElement, MouseEvent>): void;
};

const MidiLoop: React.FC<Props> = ({
  name,
  midi,
  start,
  end,
  startMove,
  startScale,
  y
}) => {
  const notes = React.useMemo<UINote[]>(() => flatten(midi), [midi]);
  const [loopStart, loopEnd] = midi.loop;
  const id = `MidiLoop_B_Q_T_D_V_B_D_${name}`;

  const loopWidth = loopEnd - loopStart;
  const containerWidth = (end - start) * NOTE;
  const containerStart = start * NOTE;
  const containerEnd = containerStart + containerWidth;
  const scaleWidth = 5;
  const noteOffset = loopStart * NOTE;
  const loopOffset = (start % loopWidth) * NOTE;

  return (
    <g>
      <defs>
        <pattern
          width={loopWidth * NOTE}
          height={STAGE_HEIGHT}
          patternUnits="userSpaceOnUse"
          id={id}
          x={loopOffset}
        >
          <g fill={colors.notes}>
            {notes.map((note, noteIndex) => (
              <rect
                key={noteIndex}
                width={note.length}
                height={1}
                x={note.at - noteOffset}
                y={STAGE_HEIGHT - note.positionY}
              />
            ))}
          </g>
          <rect
            fill={colors.notesBackground}
            opacity={0.3}
            width="100%"
            height="100%"
          />
        </pattern>
      </defs>
      <rect
        y={y}
        onMouseDown={(event) => startMove?.(event)}
        x={containerStart}
        width={containerWidth}
        height={STAGE_HEIGHT}
        fill={'url(#' + id + ')'}
        stroke={colors.notesBackground}
        strokeWidth={0.3}
      />
      <rect
        x={containerEnd - scaleWidth}
        y={y}
        width={scaleWidth}
        height={STAGE_HEIGHT}
        fill={'gray'}
        fillOpacity={0.05}
        onMouseDown={(event) => startScale?.(event)}
        style={{ cursor: 'e-resize' }}
      />
    </g>
  );
};

export { MidiLoop };
