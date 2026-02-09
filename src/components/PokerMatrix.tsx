import { useState, useRef, useEffect, useCallback } from 'react';
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
  const [isTouchDragging, setIsTouchDragging] = useState(false);
  const matrixRef = useRef<HTMLDivElement>(null);
  const matrix = generatePokerMatrix();

  // Инициализация ячеек только один раз
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
  }, []); // Пустой массив зависимостей - выполняется только при монтировании

  const getCellIndex = useCallback((row: number, col: number) => row * 13 + col, []);

  const paintCell = useCallback((row: number, col: number) => {
    if (!activeColor || isTrainerMode) return;
    
    const index = getCellIndex(row, col);
    
    onCellsChange(prevCells => {
      const newCells = [...prevCells];
      
      if (newCells[index].color === activeColor && newCells[index].actionId === activeActionId) {
        newCells[index].color = null;
        newCells[index].actionId = null;
      } else {
        newCells[index].color = activeColor;
        newCells[index].actionId = activeActionId;
      }
      
      return newCells;
  });}, [activeColor, activeActionId, getCellIndex, onCellsChange, isTrainerMode]);
  const handleMouseDown = useCallback((e: React.MouseEvent, row: number, col: number) => {
    if (isTrainerMode && comparisonCells) {
      return;
    }
    e.preventDefault(); // Предотвращаем выделение текста
    setIsDragging(true);
    paintCell(row, col);
  }, [isTrainerMode, comparisonCells, paintCell]);

  const handleMouseEnter = useCallback((row: number, col: number) => {
    if (isDragging && !isTrainerMode) {
      paintCell(row, col);
    }
  }, [isDragging, isTrainerMode, paintCell]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Обработка touch событий для мобильных устройств
  const handleTouchStart = useCallback((e: React.TouchEvent, row: number, col: number) => {
    if (isTrainerMode && comparisonCells) {
      return;
    }
    e.preventDefault();
    setIsTouchDragging(true);
    paintCell(row, col);
  }, [isTrainerMode, comparisonCells, paintCell]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isTouchDragging || isTrainerMode) return;
    
    const touch = e.touches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    
    if (element && element.hasAttribute('data-cell')) {
      const row = parseInt(element.getAttribute('data-row') || '0', 10);
      const col = parseInt(element.getAttribute('data-col') || '0', 10);
      paintCell(row, col);
    }
  }, [isTouchDragging, isTrainerMode, paintCell]);

  const handleTouchEnd = useCallback(() => {
    setIsTouchDragging(false);
  }, []);

  // Глобальные обработчики для предотвращения застревания dragging
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsDragging(false);
    };
    
    const handleGlobalTouchEnd = () => {
      setIsTouchDragging(false);
    };

    // Обработка ухода курсора за пределы окна
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.relatedTarget === null) {
        setIsDragging(false);
      }
    };

    document.addEventListener('mouseup', handleGlobalMouseUp);
    document.addEventListener('touchend', handleGlobalTouchEnd);
    document.addEventListener('mouseleave', handleMouseLeave);
    
    return () => {
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      document.removeEventListener('touchend', handleGlobalTouchEnd);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  const getCellComparison = useCallback((index: number): 'correct' | 'incorrect' | null => {
    if (!comparisonCells) return null;
    
    const userCell = cells[index];
    const originalCell = comparisonCells[index];
    
    if (!originalCell.color && !userCell.color) return null;
    
    return userCell.color === originalCell.color &&
           userCell.actionId === originalCell.actionId ? 'correct' : 'incorrect';
  }, [cells, comparisonCells]);

  return (
    <div
      ref={matrixRef}
      className={`grid grid-cols-13 gap-1 select-none ${isDragging || isTouchDragging ? 'cursor-crosshair' : ''}`}
      onMouseLeave={handleMouseUp}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
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
              data-cell="true"
              data-row={rowIndex}
              data-col={colIndex}
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
                color: cell.color ? '#fff' : '#000',
                touchAction: 'none' // Предотвращаем прокрутку на мобильных
              }}
              onMouseDown={(e) => handleMouseDown(e, rowIndex, colIndex)}
              onMouseEnter={() => handleMouseEnter(rowIndex, colIndex)}
              onTouchStart={(e) => handleTouchStart(e, rowIndex, colIndex)}
            >
              {hand}
            </div>
          );
        })
      )}
    </div>
  );
}
