const ranks = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];

export function generatePokerMatrix(): string[][] {
  const matrix: string[][] = [];

  for (let row = 0; row < 13; row++) {
    const matrixRow: string[] = [];
    for (let col = 0; col < 13; col++) {
      if (row === col) {
        matrixRow.push(`${ranks[row]}${ranks[col]}`);
      } else if (col > row) {
        matrixRow.push(`${ranks[row]}${ranks[col]}s`);
      } else {
        matrixRow.push(`${ranks[col]}${ranks[row]}o`);
      }
    }
    matrix.push(matrixRow);
  }

  return matrix;
}
