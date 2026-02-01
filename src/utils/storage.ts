import { SavedRange } from '../types/poker';

const STORAGE_KEY = 'poker-ranges';

export function saveRange(range: SavedRange): void {
  const ranges = loadRanges();
  const existingIndex = ranges.findIndex(r => r.id === range.id);

  if (existingIndex >= 0) {
    ranges[existingIndex] = range;
  } else {
    ranges.push(range);
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(ranges));
}

export function loadRanges(): SavedRange[] {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

export function deleteRange(id: string): void {
  const ranges = loadRanges().filter(r => r.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ranges));
}
