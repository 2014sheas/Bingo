import { Cell } from "../types";

/**
 * Generate bingo card values using standard bingo patterns
 */
export function generateBingoValues(): string[] {
  // B: 1-15, I: 16-30, N: 31-45, G: 46-60, O: 61-75
  const columns = [
    generateNumbersInRange(1, 15), // B
    generateNumbersInRange(16, 30), // I
    generateNumbersInRange(31, 45), // N
    generateNumbersInRange(46, 60), // G
    generateNumbersInRange(61, 75), // O
  ];

  // Convert from columns to rows format
  const values: string[] = [];
  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 5; j++) {
      const letter = "BINGO"[j];
      const value = j === 2 && i === 2 ? "FREE" : `${letter}${columns[j][i]}`;
      values.push(value);
    }
  }

  return values;
}

/**
 * Generate random numbers in a range without duplicates
 */
function generateNumbersInRange(min: number, max: number): number[] {
  const numbers: number[] = [];
  const available = Array.from({ length: max - min + 1 }, (_, i) => min + i);

  for (let i = 0; i < 5; i++) {
    const randomIndex = Math.floor(Math.random() * available.length);
    numbers.push(available[randomIndex]);
    available.splice(randomIndex, 1);
  }

  return numbers;
}

/**
 * Check if the current board state has a winning condition
 */
export function checkForWin(cells: Cell[]): boolean {
  const size = Math.sqrt(cells.length);
  if (!Number.isInteger(size)) {
    return false; // Not a square grid
  }

  // Check rows
  for (let row = 0; row < size; row++) {
    let rowWin = true;
    for (let col = 0; col < size; col++) {
      const index = row * size + col;
      if (!cells[index].isMarked) {
        rowWin = false;
        break;
      }
    }
    if (rowWin) return true;
  }

  // Check columns
  for (let col = 0; col < size; col++) {
    let colWin = true;
    for (let row = 0; row < size; row++) {
      const index = row * size + col;
      if (!cells[index].isMarked) {
        colWin = false;
        break;
      }
    }
    if (colWin) return true;
  }

  // Check diagonals
  let diag1Win = true;
  let diag2Win = true;
  for (let i = 0; i < size; i++) {
    if (!cells[i * size + i].isMarked) {
      diag1Win = false;
    }
    if (!cells[i * size + (size - 1 - i)].isMarked) {
      diag2Win = false;
    }
  }

  return diag1Win || diag2Win;
}
