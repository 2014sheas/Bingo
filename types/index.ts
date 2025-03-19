// Basic Bingo cell representation
export interface Cell {
  id: number;
  value: string;
  isMarked: boolean;
  isFreeSpace?: boolean;
}

// Props for the BingoCard component
export interface BingoCardProps {
  cells: Cell[];
  onCellPress: (id: number) => void;
}

// Props for the BingoCell component
export interface BingoCellProps {
  cell: Cell;
  onPress: () => void;
}

// Props for the Header component
export interface HeaderProps {
  onReset: () => void;
  hasWon: boolean;
}
