import { useState, useRef, useEffect } from 'react';
import { Copy, Edit2, ChevronDown } from 'lucide-react';
import { SavedRange } from '../types/poker';

interface RangeContextMenuProps {
  savedRanges: SavedRange[];
  selectedRangeId: string;
  onRangeSelect: (rangeId: string) => void;
  onEditRange: (range: SavedRange) => void;
  onDuplicateRange: (range: SavedRange) => void;
}

export default function RangeContextMenu({
  savedRanges,
  selectedRangeId,
  onRangeSelect,
  onEditRange,
  onDuplicateRange
}: RangeContextMenuProps) {
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [rightClickedRangeId, setRightClickedRangeId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedRange = savedRanges.find(r => r.id === selectedRangeId);

  const handleRangeClick = (e: React.MouseEvent, rangeId: string) => {
    e.stopPropagation();
    const element = e.currentTarget as HTMLElement;
    const rect = element.getBoundingClientRect();
    setContextMenu({ x: rect.left, y: rect.bottom + 8 });
    setRightClickedRangeId(rangeId);
  };

  useEffect(() => {
    const handleClickOutside = () => {
      setContextMenu(null);
    };

    if (contextMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [contextMenu]);

  const handleEdit = () => {
    const range = savedRanges.find(r => r.id === rightClickedRangeId);
    if (range) {
      onEditRange(range);
    }
    setContextMenu(null);
  };

  const handleDuplicate = () => {
    const range = savedRanges.find(r => r.id === rightClickedRangeId);
    if (range) {
      onDuplicateRange(range);
    }
    setContextMenu(null);
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="space-y-2">
        {savedRanges.length > 0 ? (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {savedRanges.map(range => (
              <div
                key={range.id}
                id={`range-${range.id}`}
                onClick={(e) => handleRangeClick(e, range.id)}
                className={`
                  p-3 rounded-lg cursor-pointer transition-all duration-200
                  ${selectedRangeId === range.id
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }
                  active:scale-95
                `}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{range.name}</span>
                  <ChevronDown size={16} className="opacity-50" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-slate-500 py-4">
            No ranges saved yet
          </div>
        )}
      </div>

      {contextMenu && rightClickedRangeId && (
        <div
          className="fixed bg-white rounded-lg shadow-xl border border-slate-200 z-50
                     animate-in fade-in duration-150"
          style={{
            left: `${Math.min(contextMenu.x, window.innerWidth - 160)}px`,
            top: `${contextMenu.y}px`,
          }}
        >
          <button
            onClick={handleEdit}
            className="w-full px-4 py-2 text-left hover:bg-blue-50 text-slate-700
                       font-semibold transition-colors flex items-center gap-2
                       border-b border-slate-100"
          >
            <Edit2 size={16} />
            Edit
          </button>
          <button
            onClick={handleDuplicate}
            className="w-full px-4 py-2 text-left hover:bg-blue-50 text-slate-700
                       font-semibold transition-colors flex items-center gap-2"
          >
            <Copy size={16} />
            Duplicate
          </button>
        </div>
      )}
    </div>
  );
}
