import { useState } from 'react';
import { Check, RotateCcw } from 'lucide-react';
import { MatrixCell, SavedRange } from '../types/poker';
import PokerMatrix from './PokerMatrix';
import RangeSelector from './RangeSelector';

interface RangeTrainerProps {
  savedRanges: SavedRange[];
  onEditRange: (range: SavedRange) => void;
  onDuplicateRange: (range: SavedRange) => void;
}

export default function RangeTrainer({ savedRanges }: RangeTrainerProps) {
  const [selectedRangeId, setSelectedRangeId] = useState<string>('');
  const [userCells, setUserCells] = useState<MatrixCell[]>([]);
  const [activeActionId, setActiveActionId] = useState<number | null>(null);
  const [comparisonCells, setComparisonCells] = useState<MatrixCell[] | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);

  const selectedRange = savedRanges.find(r => r.id === selectedRangeId);

  const handleRangeSelect = (rangeId: string) => {
    setSelectedRangeId(rangeId);
    setUserCells([]);
    setComparisonCells(null);
    setAccuracy(null);

    const range = savedRanges.find(r => r.id === rangeId);
    if (range && range.actions.length > 0) {
      setActiveActionId(range.actions[0].id);
    }
  };

  const handleCheck = () => {
    if (!selectedRange) return;

    setComparisonCells(selectedRange.cells);

    const totalCells = selectedRange.cells.length;
    let correctCells = 0;

    for (let i = 0; i < totalCells; i++) {
      const userCell = userCells[i] || { hand: '', color: null, actionId: null };
      const originalCell = selectedRange.cells[i];

      if (userCell.color === originalCell.color &&
          userCell.actionId === originalCell.actionId) {
        correctCells++;
      }
    }

    const accuracyPercent = Math.round((correctCells / totalCells) * 100);
    setAccuracy(accuracyPercent);
  };

  const handleReset = () => {
    setUserCells([]);
    setComparisonCells(null);
    setAccuracy(null);
  };

  const activeColor = selectedRange?.actions.find(a => a.id === activeActionId)?.color || null;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-md p-6 space-y-4">
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Select a range to practice...
        </label>
        <RangeSelector
          savedRanges={savedRanges}
          selectedRangeId={selectedRangeId}
          onRangeSelect={handleRangeSelect}
        />

        {selectedRange && (
          <>
            <div className="flex flex-wrap gap-2">
              {selectedRange.actions.map(action => (
                <button
                  key={action.id}
                  className={`
                    px-4 py-2 rounded-lg font-semibold text-white
                    transition-all duration-200
                    ${activeActionId === action.id
                      ? 'ring-4 ring-blue-400 ring-opacity-50 scale-105 shadow-lg'
                      : 'hover:scale-105 shadow-md'
                    }
                  `}
                  style={{ backgroundColor: action.color }}
                  onClick={() => setActiveActionId(action.id)}
                >
                  {action.name}
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCheck}
                className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-lg
                           font-semibold hover:bg-blue-600 transition-colors
                           flex items-center justify-center gap-2 shadow-lg"
              >
                <Check size={20} />
                Check
              </button>
              <button
                onClick={handleReset}
                className="flex-1 px-6 py-3 bg-slate-500 text-white rounded-lg
                           font-semibold hover:bg-slate-600 transition-colors
                           flex items-center justify-center gap-2 shadow-lg"
              >
                <RotateCcw size={20} />
                Reset
              </button>
            </div>

            {accuracy !== null && (
              <div className={`
                text-center text-2xl font-bold p-4 rounded-lg
                ${accuracy >= 90 ? 'bg-green-100 text-green-700' :
                  accuracy >= 70 ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'}
              `}>
                Accuracy: {accuracy}%
              </div>
            )}
          </>
        )}
      </div>

      {selectedRange && (
        <PokerMatrix
          cells={userCells}
          onCellsChange={setUserCells}
          activeColor={activeColor}
          activeActionId={activeActionId}
          isTrainerMode={true}
          comparisonCells={comparisonCells}
        />
      )}
    </div>
  );
}
