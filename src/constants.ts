import { AudioObject, SimulationState } from '@/types/audio';
import { v4 as uuidv4 } from 'uuid';

export const DEFAULT_STATE: SimulationState = {
  objects: [
    {
      id: 'spk-1',
      type: 'speaker',
      position: { x: 1, y: 5 },
      gain: 0.62,
      channel: 0,
      name: 'Main Speaker',
      muted: false
    },
    {
      id: 'mic-1',
      type: 'microphone',
      position: { x: 8.85, y: 5 },
      gain: 1.0,
      channel: 0,
      name: 'Vocal Mic',
      muted: false
    }
  ],
  isPlaying: false,
  masterVolume: 0.82,
  dryWet: 0.18,
  roomSize: { x: 10, y: 10 }
};

export const createObject = (type: 'speaker' | 'microphone', roomSize: {x: number, y: number}): AudioObject => ({
  id: uuidv4(),
  type,
  position: { x: roomSize.x / 2, y: roomSize.y / 2 },
  gain: 1.0,
  channel: 0,
  name: `New ${type === 'speaker' ? 'Speaker' : 'Mic'}`,
  muted: false
});
