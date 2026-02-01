import { SavedRange } from '../types/poker';

interface RangeSelectorProps {
  savedRanges: SavedRange[];
  selectedRangeId: string;
  onRangeSelect: (rangeId: string) => void;
}

export default function RangeSelector({
  savedRanges,
  selectedRangeId,
  onRangeSelect
}: RangeSelectorProps) {
  return (
    <div className="space-y-2">
      {savedRanges.length > 0 ? (
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {savedRanges.map(range => (
            <div
              key={range.id}
              onClick={() => onRangeSelect(range.id)}
              className={`
                p-3 rounded-lg cursor-pointer transition-all duration-200
                ${selectedRangeId === range.id
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }
                active:scale-95
              `}
            >
              <span className="font-semibold">{range.name}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-slate-500 py-4">
          No ranges saved yet
        </div>
      )}
    </div>
  );
}
