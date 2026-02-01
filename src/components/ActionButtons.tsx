import { X, Plus } from 'lucide-react';
import { ActionButton } from '../types/poker';

interface ActionButtonsProps {
  actions: ActionButton[];
  activeActionId: number;
  onActionClick: (id: number) => void;
  onActionEdit: (id: number) => void;
  onActionDelete: (id: number) => void;
  onActionAdd: () => void;
}

const DEFAULT_COLORS = [
  '#ff4444',
  '#44ff44',
  '#4444ff',
  '#ffff44',
  '#ff44ff',
  '#44ffff',
  '#ff8844'
];

export default function ActionButtons({
  actions,
  activeActionId,
  onActionClick,
  onActionEdit,
  onActionDelete,
  onActionAdd
}: ActionButtonsProps) {
  const canAddMore = actions.length < 7;

  return (
    <div className="flex flex-col gap-2">
      {actions.map((action) => (
        <div key={action.id} className="relative group">
          <button
            className={`
              w-full px-4 py-2 rounded-lg font-semibold text-white
              transition-all duration-200
              ${activeActionId === action.id
                ? 'ring-4 ring-blue-400 ring-opacity-50 scale-105 shadow-lg'
                : 'hover:scale-105 shadow-md'
              }
            `}
            style={{ backgroundColor: action.color }}
            onClick={() => onActionClick(action.id)}
          >
            {action.name}
          </button>
          {action.id !== 1 && (
            <button
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6
                         flex items-center justify-center opacity-0 group-hover:opacity-100
                         transition-opacity duration-200 hover:bg-red-600"
              onClick={() => onActionDelete(action.id)}
            >
              <X size={16} />
            </button>
          )}
        </div>
      ))}

      {canAddMore && (
        <button
          className="w-full px-4 py-2 rounded-lg font-semibold text-slate-500 bg-slate-200
                     hover:bg-slate-300 transition-all duration-200 flex items-center justify-center gap-2
                     opacity-60 hover:opacity-100"
          onClick={onActionAdd}
        >
          <Plus size={16} />
          Action {actions.length + 1}
        </button>
      )}
    </div>
  );
}

export { DEFAULT_COLORS };
