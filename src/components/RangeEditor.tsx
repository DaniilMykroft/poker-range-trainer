import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import { ActionButton, MatrixCell, SavedRange } from '../types/poker';
import { DEFAULT_COLORS } from './ActionButtons';
import ActionButtons from './ActionButtons';
import ColorEditor from './ColorEditor';
import PokerMatrix from './PokerMatrix';

interface RangeEditorProps {
  onRangeSave: (range: Omit<SavedRange, 'id' | 'createdAt'>, existingRangeId?: string) => void;
  currentFolderId?: string | null;
  currentRange?: SavedRange;
}

export default function RangeEditor({ onRangeSave, currentFolderId = null, currentRange }: RangeEditorProps) {
  const [rangeName, setRangeName] = useState('');
  const [cells, setCells] = useState<MatrixCell[]>([]);
  const [actions, setActions] = useState<ActionButton[]>([
    { id: 1, name: 'Action 1', color: DEFAULT_COLORS[0] }
  ]);
  const [activeActionId, setActiveActionId] = useState(1);
  const [editingAction, setEditingAction] = useState<ActionButton | null>(null);

  // Загрузка данных range при открытии для редактирования
  useEffect(() => {
    if (currentRange) {
      setRangeName(currentRange.name);
      setCells(currentRange.cells);
      setActions(currentRange.actions);
      setActiveActionId(currentRange.actions[0]?.id || 1);
    } else {
      // Сброс при создании нового range
      setRangeName('');
      setCells([]);
      setActions([{ id: 1, name: 'Action 1', color: DEFAULT_COLORS[0] }]);
      setActiveActionId(1);
    }
  }, [currentRange]);

  const handleActionAdd = () => {
    if (actions.length >= 7) return;

    const newId = Math.max(...actions.map(a => a.id)) + 1;
    const newAction: ActionButton = {
      id: newId,
      name: `Action ${newId}`,
      color: DEFAULT_COLORS[actions.length % DEFAULT_COLORS.length]
    };

    setActions([...actions, newAction]);
    setActiveActionId(newId);
    setEditingAction(newAction);
  };

  const handleActionDelete = (id: number) => {
    if (id === 1) return;

    setActions(actions.filter(a => a.id !== id));

    const newCells = cells.map(cell =>
      cell.actionId === id ? { ...cell, color: null, actionId: null } : cell
    );
    setCells(newCells);

    if (activeActionId === id) {
      setActiveActionId(1);
    }
  };

  const handleActionClick = (id: number) => {
    setActiveActionId(id);
    const action = actions.find(a => a.id === id);
    if (action) {
      setEditingAction(action);
    }
  };

  const handleActionEdit = (id: number) => {
    const action = actions.find(a => a.id === id);
    if (action) {
      setEditingAction(action);
    }
  };

  const handleColorSave = (name: string, color: string) => {
    if (!editingAction) return;

    const updatedActions = actions.map(a =>
      a.id === editingAction.id ? { ...a, name, color } : a
    );
    setActions(updatedActions);

    const updatedCells = cells.map(cell =>
      cell.actionId === editingAction.id ? { ...cell, color } : cell
    );
    setCells(updatedCells);

    setEditingAction(null);
  };

  const handleSaveRange = () => {
    if (!rangeName.trim()) {
      alert('Please enter a range name');
      return;
    }

    const usedCells = cells.filter(cell => cell.color !== null);
    if (usedCells.length === 0) {
      alert('Please paint at least one cell');
      return;
    }

    const range: Omit<SavedRange, 'id' | 'createdAt'> = {
      name: rangeName,
      cells: cells,
      actions: actions,
      folderId: currentRange?.folderId ?? currentFolderId
    };

    // Передаем ID если редактируем существующий range
    onRangeSave(range, currentRange?.id);
    
    // Очищаем форму только если это был новый range
    if (!currentRange) {
      setRangeName('');
      setCells([]);
    }
  };

  const activeColor = actions.find(a => a.id === activeActionId)?.color || null;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-md p-6">
        <input
          type="text"
          value={rangeName}
          onChange={(e) => setRangeName(e.target.value)}
          placeholder="Enter range name..."
          className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg
                     focus:border-blue-500 focus:outline-none transition-colors
                     text-lg font-semibold"
        />
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1">
          <PokerMatrix
            cells={cells}
            onCellsChange={setCells}
            activeColor={activeColor}
            activeActionId={activeActionId}
          />
        </div>

        <div className="lg:w-64 bg-white rounded-xl shadow-md p-6 space-y-4">
          <ActionButtons
            actions={actions}
            activeActionId={activeActionId}
            onActionClick={handleActionClick}
            onActionEdit={handleActionEdit}
            onActionDelete={handleActionDelete}
            onActionAdd={handleActionAdd}
          />

          <button
            onClick={handleSaveRange}
            className="w-full px-6 py-3 bg-green-500 text-white rounded-lg
                       font-semibold hover:bg-green-600 transition-colors
                       flex items-center justify-center gap-2 shadow-lg"
          >
            <Save size={20} />
            {currentRange ? 'Update Range' : 'Save Range'}
          </button>
        </div>
      </div>

      {editingAction && (
        <ColorEditor
          actionName={editingAction.name}
          actionColor={editingAction.color}
          onSave={handleColorSave}
          onCancel={() => setEditingAction(null)}
        />
      )}
    </div>
  );
}
