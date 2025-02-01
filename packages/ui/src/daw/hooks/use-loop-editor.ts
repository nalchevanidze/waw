import * as React from 'react';
import { Area, Maybe } from '../types';
import { distanceX } from '../utils/area';
import { STEP } from '../../common/units';
import { useTrack } from './use-track';

export type LoopTarget = 'start' | 'end';

export const useLoop = () => {
  const [{ id, midi }, dispatch] = useTrack();

  const [origin, setOrigin] = React.useState<Maybe<number>>(undefined);
  const [target, setTarget] = React.useState<Maybe<LoopTarget>>(undefined);
  const [state, setLoop] = React.useState(midi.loop);

  React.useEffect(() => {
    setLoop(midi.loop);
  }, [midi.loop]);

  const sync = () =>
    dispatch({ id, type: 'SET_MIDI', payload: { loop: state } });

  const [start, end] = state;

  const startMove = (t: LoopTarget) => {
    setOrigin(t === 'start' ? start : end);
    setTarget(t);
  };

  const endMove = () => {
    setOrigin(undefined);
    setTarget(undefined);
    sync();
  };

  const move = (area: Area) => {
    const time = distanceX(area, STEP, STEP);

    if (origin === undefined) return;

    const [start, end] = state;
    switch (target) {
      case 'start':
        return setLoop([origin + time, end]);
      case 'end':
        return setLoop([start, origin + time]);
    }
  };

  return {
    target,
    startMove,
    endMove,
    state,
    move
  };
};
