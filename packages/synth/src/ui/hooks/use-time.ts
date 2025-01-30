import { useContext } from 'react';
import { NOTE, QUARTER } from '../common/units';
import { DawApiContext } from '../context/daw-state';

export const useTime = () => {
  const [{ player, tracks }] = useContext(DawApiContext);
  const midi = tracks.tracks[tracks.currentTrack].midi;
  const loopSize = midi.loop[1] - midi.loop[0];
  const start = midi.start;
  const end = midi.end;
  const time = player.time / NOTE;
  const loopStart = midi.loop[0];
  const offset = start % loopSize;

  const loopTime =
    time < start || time > end ? 0 : loopStart - offset + (time % loopSize);

  return {
    time: loopTime * QUARTER,
    loop: midi.loop,
    end: midi.end * NOTE
  };
};
