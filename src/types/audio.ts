export interface Point {
  x: number;
  y: number;
}

export interface AudioObject {
  id: string;
  type: 'speaker' | 'microphone';
  position: Point;
  gain: number; // 0-1 (or >1 for boost)
  channel: number; // 0 (Left/Mono) or 1 (Right)
  name: string;
  muted: boolean;
}

export interface SimulationState {
  objects: AudioObject[];
  isPlaying: boolean;
  masterVolume: number;
  dryWet: number; // 0 = Dry only, 1 = Wet only
  roomSize: Point; // Dimensions in meters
}

export const SPEED_OF_SOUND = 343; // m/s
