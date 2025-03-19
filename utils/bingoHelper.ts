import { Cell } from "../types";

/**
 * Generate bingo card values using standard bingo patterns
 */
export function generateBingoValues(
  customValues?: string[],
  showFreeSpace: boolean = true,
  freeSpaceText: string = "FREE"
): string[] {
  if (customValues && customValues.length >= 25) {
    return generateCustomBingoValues(
      customValues,
      showFreeSpace,
      freeSpaceText
    );
  }

  // Standard bingo with B1-O75 format
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
      // Center position is row 2, column 2 (0-indexed)
      const isCenterPosition = j === 2 && i === 2;

      if (isCenterPosition && showFreeSpace) {
        values.push(freeSpaceText);
      } else {
        // For regular cells, including center when free space is disabled
        const letter = "BINGO"[j];
        values.push(`${letter}${columns[j][i]}`);
      }
    }
  }

  return values;
}

/**
 * Generate custom bingo card with user-provided values
 */
function generateCustomBingoValues(
  customValues: string[],
  showFreeSpace: boolean = true,
  freeSpaceText: string = "FREE"
): string[] {
  // Make a copy and shuffle the array
  const shuffled = [...customValues].sort(() => 0.5 - Math.random());

  if (showFreeSpace) {
    // Pick the first 24 values (saving space for FREE in the middle)
    const selectedValues = shuffled.slice(0, 24);

    // Create the final array with custom FREE text in the middle (12th position)
    const result = [
      ...selectedValues.slice(0, 12),
      freeSpaceText,
      ...selectedValues.slice(12),
    ];

    return result;
  } else {
    // Without a free space, just take 25 values
    return shuffled.slice(0, 25);
  }
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
