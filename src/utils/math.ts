import { Point } from '@/types/audio';

export const calculateDistance = (p1: Point, p2: Point): number => {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
};

export const dbToGain = (db: number): number => {
  return Math.pow(10, db / 20);
};

export const gainToDb = (gain: number): number => {
  if (gain <= 0) return -Infinity;
  return 20 * Math.log10(gain);
};
