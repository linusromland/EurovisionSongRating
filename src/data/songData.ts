import type { Song } from '../types';
import songData from './songData.json';

export const K_FACTOR = 32;
export const INITIAL_ELO = 1500;
export const SCOREBOARD_INITIAL_LIMIT = 5;

export const initialSongsData: Song[] = songData;