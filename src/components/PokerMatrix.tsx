import { useState, useRef, useEffect } from 'react';
import { MatrixCell } from '../types/poker';
import { generatePokerMatrix } from '../utils/pokerHands';

interface PokerMatrixProps {
  cells: MatrixCell[];
  onCellsChange: (cells: MatrixCell[]) => void;
  activeColor: string | null;
  activeActionId: number | null;
  isTrainerMode?: boolean;
  comparisonCells?: MatrixCell[] | null;
}

export default function PokerMatrix({
  cells,
  onCellsChange,
  activeColor,
  activeActionId,
  isTrainerMode = false,
  comparisonCells = null
}: PokerMatrixProps) {
  const [isDragging, setIsDragging] = useState(false);
  const matrixRef = useRef<HTMLDivElement>(null);
  const matrix = generatePokerMatrix();

  useEffect(() => {
    if (cells.length === 0) {
      const initialCells: MatrixCell[] = [];
      for (let row = 0; row < 13; row++) {
        for (let col = 0; col < 13; col++) {
          initialCells.push({
            hand: matrix[row][col],
            color: null,
            actionId: null
          });
        }
      }
      onCellsChange(initialCells);
    }
  }, [cells.length]);

  const getCellIndex = (row: number, col: number) => row * 13 + col;

  const paintCell = (row: number, col: number) => {
    if (!activeColor) return;

    const index = getCellIndex(row, col);
    const newCells = [...cells];

    if (newCells[index].color === activeColor && newCells[index].actionId === activeActionId) {
      newCells[index].color = null;
      newCells[index].actionId = null;
    } else {
      newCells[index].color = activeColor;
      newCells[index].actionId = activeActionId;
    }

    onCellsChange(newCells);
  };

  const handleMouseDown = (row: number, col: number) => {
    if (isTrainerMode && comparisonCells) {
      return;
    }
    setIsDragging(true);
    paintCell(row, col);
  };

  const handleMouseEnter = (row: number, col: number) => {
    if (isDragging) {
      paintCell(row, col);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => setIsDragging(false);
    document.addEventListener('mouseup', handleGlobalMouseUp);
    return () => document.removeEventListener('mouseup', handleGlobalMouseUp);
  }, []);

  const getCellComparison = (index: number): 'correct' | 'incorrect' | null => {
    if (!comparisonCells) return null;

    const userCell = cells[index];
    const originalCell = comparisonCells[index];

    if (!originalCell.color && !userCell.color) return null;

    return userCell.color === originalCell.color &&
           userCell.actionId === originalCell.actionId ? 'correct' : 'incorrect';
  };

  return (
    <div
      ref={matrixRef}
      className={`grid grid-cols-13 gap-1 select-none ${isDragging ? 'cursor-crosshair' : ''}`}
      onMouseLeave={handleMouseUp}
      style={{ maxWidth: '600px', margin: '0 auto' }}
    >
      {matrix.map((row, rowIndex) =>
        row.map((hand, colIndex) => {
          const index = getCellIndex(rowIndex, colIndex);
          const cell = cells[index] || { hand, color: null, actionId: null };
          const comparison = getCellComparison(index);

          const isPocketPair = rowIndex === colIndex;
          const isSuited = colIndex > rowIndex;

          return (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={`
                aspect-square flex items-center justify-center text-xs font-bold
                border-2 rounded cursor-pointer transition-all
                ${isPocketPair ? 'bg-slate-100' : isSuited ? 'bg-blue-50' : 'bg-red-50'}
                ${comparison === 'correct' ? 'border-green-500 border-4' : ''}
                ${comparison === 'incorrect' ? 'border-red-500 border-4' : ''}
                ${!comparison ? 'border-slate-300 hover:border-slate-400' : ''}
              `}
              style={{
                backgroundColor: cell.color || undefined,
                color: cell.color ? '#fff' : '#000'
              }}
              onMouseDown={() => handleMouseDown(rowIndex, colIndex)}
              onMouseEnter={() => handleMouseEnter(rowIndex, colIndex)}
              onTouchStart={(e) => {
                e.preventDefault();
                handleMouseDown(rowIndex, colIndex);
              }}
            >
              {hand}
            </div>
          );
        })
      )}
    </div>
  );
}
