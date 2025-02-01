import * as React from 'react';
import { Preset } from '@wdaw/engine';
import { DawDispatch } from '../types';
import { DawApiContext } from '../../context/state';

export const usePreset = (): [Preset, DawDispatch] => {
  const [
    {
      tracks: { currentTrack, tracks }
    },
    dispatch
  ] = React.useContext(DawApiContext);

  const track = tracks[currentTrack];
  return [track.preset, dispatch];
};
