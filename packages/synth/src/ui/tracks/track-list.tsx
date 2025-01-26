import * as React from 'react';
import { ConfiguratorContext } from '../configurator';
import { Track } from './track';
import { Timeline } from './timeline';
import { PANEL } from './defs';
import { NOTE, BLOCK } from '../common/units';
import { SvgStage } from '@wdaw/svg';
import { STAGE_HEIGHT } from './midi-loop';

export const TrackList: React.FC = () => {
  const [{ tracks, player }] = React.useContext(ConfiguratorContext);
  const maxTrackSize = Math.max(...tracks.tracks.map((t) => t.midi.end));
  const width = maxTrackSize * NOTE + PANEL + BLOCK;
  const position = PANEL + player.time;

  const height = STAGE_HEIGHT * tracks.tracks.length

  return (
    <div style={{ width: '100%', height: 'auto', position: 'relative' }}>
      <Timeline width={width} height={16} />
      <div
        style={{
          position: 'absolute',
          width: '2px',
          top: '0',
          bottom: '0',
          left: `${position}px`,
          background: 'red'
        }}
      />
      <SvgStage
        viewBox={[-PANEL, 0, width, height].join(' ')}
        width={width}
        height={height}
        style={{
          background: '#FFF',
          border: '1px solid #BBB',
          display: 'block'
        }}
      >
        {tracks.tracks.map(({ midi, name }, i) => (
          <Track midi={midi} id={i} name={name} key={i} width={width} />
        ))}
      </SvgStage>
    </div>
  );
};
