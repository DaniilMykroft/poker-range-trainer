export interface PokerHand {
  rank1: string;
  rank2: string;
  suited: boolean;
}

export interface MatrixCell {
  hand: string;
  color: string | null;
  actionId: number | null;
}

export interface ActionButton {
  id: number;
  name: string;
  color: string;
}

export interface SavedRange {
  id: string;
  name: string;
  cells: MatrixCell[];
  actions: ActionButton[];
  createdAt: string;
  folderId: string | null;
}

export interface Folder {
  id: string;
  name: string;
  parentId: string | null;
  createdAt: string;
}

export type CatalogItem =
  | { type: 'folder'; data: Folder }
  | { type: 'range'; data: SavedRange };
