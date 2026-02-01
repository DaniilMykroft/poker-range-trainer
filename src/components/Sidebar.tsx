import { useState, useRef } from 'react';
import { FolderPlus, LayoutGrid, ChevronRight, ChevronDown, Folder as FolderIcon, X, Edit2, Copy, Trash2 } from 'lucide-react';
import { Folder, SavedRange } from '../types/poker';
import { deleteRangeFromSupabase } from '../utils/supabaseStorage';

interface SidebarProps {
  folders: Folder[];
  ranges: SavedRange[];
  currentRangeId: string | null;
  currentFolderId: string | null;
  onFolderCreate: (name: string, parentId: string | null) => void;
  onRangeSelect: (rangeId: string) => void;
  onNewRange: (folderId: string | null) => void;
  onMoveFolder: (folderId: string, newParentId: string | null) => void;
  onMoveRange: (rangeId: string, newFolderId: string | null) => void;
  onFolderClick: (folderId: string | null) => void;
  onEditRange?: (range: SavedRange) => void;
  onDuplicateRange?: (range: SavedRange) => void;
  onDeleteRange?: (rangeId: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({
  folders,
  ranges,
  currentRangeId,
  currentFolderId,
  onFolderCreate,
  onRangeSelect,
  onNewRange,
  onMoveFolder,
  onMoveRange,
  onFolderClick,
  onEditRange,
  onDuplicateRange,
  onDeleteRange,
  isOpen,
  onClose
}: SidebarProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [draggedItem, setDraggedItem] = useState<{ type: 'folder' | 'range'; id: string; folderId?: string | null } | null>(null);
  const [dropTarget, setDropTarget] = useState<{ type: 'folder' | 'range'; id: string | null } | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [contextMenuRangeId, setContextMenuRangeId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const handleFolderCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newFolderName.trim()) {
      onFolderCreate(newFolderName.trim(), currentFolderId);
      setNewFolderName('');
      setCreatingFolder(false);
    }
  };

  const handleDragStart = (e: React.DragEvent, type: 'folder' | 'range', id: string, folderId?: string | null) => {
    setDraggedItem({ type, id, folderId });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, targetType: 'folder' | 'range', targetId: string | null, targetFolderId?: string | null) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';

    if (!draggedItem) return;

    // Не позволяем дропать элемент на сам себя
    if (draggedItem.id === targetId) {
      setDropTarget(null);
      return;
    }

    // Для папок - не позволяем дропать папку на саму себя
    if (draggedItem.type === 'folder' && targetType === 'folder' && draggedItem.id === targetId) {
      setDropTarget(null);
      return;
    }

    // Устанавливаем drop target с информацией о типе
    if (targetType === 'folder') {
      setDropTarget({ type: 'folder', id: targetId });
    } else {
      // Для range - показываем что можем дропнуть, но реально дропаем в папку где этот range
      setDropTarget({ type: 'range', id: targetFolderId });
    }
  };

  const handleDrop = (e: React.DragEvent, targetType: 'folder' | 'range', targetId: string | null, targetFolderId?: string | null) => {
    e.preventDefault();
    e.stopPropagation();

    if (!draggedItem) return;

    // Не позволяем дропать на себя
    if (draggedItem.id === targetId) {
      setDraggedItem(null);
      setDropTarget(null);
      return;
    }

    if (draggedItem.type === 'folder') {
      const actualTargetId = targetType === 'folder' ? targetId : targetFolderId;
      
      if (draggedItem.id !== actualTargetId) {
        const isDescendant = (parentId: string | null, checkId: string): boolean => {
          if (!parentId) return false;
          if (parentId === checkId) return true;
          const parent = folders.find(f => f.id === parentId);
          if (!parent) return false;
          return isDescendant(parent.parentId, checkId);
        };

        if (!isDescendant(actualTargetId, draggedItem.id)) {
          onMoveFolder(draggedItem.id, actualTargetId);
        }
      }
    } else {
      // Для range
      let newFolderId: string | null;
      
      if (targetType === 'folder') {
        // Дропаем на папку
        newFolderId = targetId;
      } else {
        // Дропаем на range - помещаем в папку где этот range
        newFolderId = targetFolderId ?? null;
      }
      
      // Перемещаем только если папка изменилась
      if (newFolderId !== draggedItem.folderId) {
        onMoveRange(draggedItem.id, newFolderId);
      }
    }

    setDraggedItem(null);
    setDropTarget(null);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDropTarget(null);
  };

  const handleRangeContextMenu = (e: React.MouseEvent, rangeId: string) => {
    e.preventDefault();
    e.stopPropagation();
    const element = e.currentTarget as HTMLElement;
    const rect = element.getBoundingClientRect();
    setContextMenu({ x: rect.left, y: rect.bottom + 8 });
    setContextMenuRangeId(rangeId);
  };

  const handleRangeClick = (e: React.MouseEvent, rangeId: string) => {
    // Игнорируем правую кнопку (она для контекстного меню)
    if (e.button === 2) return;
    
    // Левый клик - показываем контекстное меню
    e.preventDefault();
    e.stopPropagation();
    const element = e.currentTarget as HTMLElement;
    const rect = element.getBoundingClientRect();
    setContextMenu({ x: rect.left, y: rect.bottom + 8 });
    setContextMenuRangeId(rangeId);
  };

  const handleEditClick = () => {
    if (contextMenuRangeId && onEditRange) {
      const range = ranges.find(r => r.id === contextMenuRangeId);
      if (range) {
        onEditRange(range);
      }
    }
    setContextMenu(null);
  };

  const handleDuplicateClick = () => {
    if (contextMenuRangeId && onDuplicateRange) {
      const range = ranges.find(r => r.id === contextMenuRangeId);
      if (range) {
        onDuplicateRange(range);
      }
    }
    setContextMenu(null);
  };

  const handleDeleteClick = () => {
    if (contextMenuRangeId) {
      setDeleteConfirm(contextMenuRangeId);
    }
    setContextMenu(null);
  };

  const confirmDelete = async () => {
    if (deleteConfirm) {
      const success = await deleteRangeFromSupabase(deleteConfirm);
      if (success) {
        if (onDeleteRange) {
          onDeleteRange(deleteConfirm);
        }
      } else {
        alert('Failed to delete range');
      }
    }
    setDeleteConfirm(null);
  };

  const renderFolderTree = (parentId: string | null, level: number = 0) => {
    const childFolders = folders.filter(f => f.parentId === parentId);
    const childRanges = ranges.filter(r => r.folderId === parentId);

    return (
      <>
        {childFolders.map(folder => {
          const isExpanded = expandedFolders.has(folder.id);
          const isDragging = draggedItem?.type === 'folder' && draggedItem.id === folder.id;
          const isFolderDropTarget = dropTarget?.type === 'folder' && dropTarget.id === folder.id;
          const isCurrentFolder = currentFolderId === folder.id;

          return (
            <div key={folder.id}>
              <div
                draggable
                onDragStart={(e) => handleDragStart(e, 'folder', folder.id)}
                onDragOver={(e) => handleDragOver(e, 'folder', folder.id)}
                onDrop={(e) => handleDrop(e, 'folder', folder.id)}
                onDragEnd={handleDragEnd}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer group
                  ${isDragging ? 'opacity-50' : ''}
                  ${isFolderDropTarget ? 'bg-blue-100 border-2 border-blue-400' : 'hover:bg-slate-100'}
                  ${isCurrentFolder ? 'bg-slate-200' : ''}`}
                style={{ paddingLeft: `${level * 16 + 12}px` }}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFolder(folder.id);
                  onFolderClick(folder.id);
                }}
              >
                {isExpanded ? (
                  <ChevronDown size={16} className="text-slate-500 flex-shrink-0" />
                ) : (
                  <ChevronRight size={16} className="text-slate-500 flex-shrink-0" />
                )}
                <FolderIcon size={18} className="text-blue-500 flex-shrink-0" />
                <span className="text-sm font-medium text-slate-700 truncate flex-1">
                  {folder.name}
                </span>
              </div>
              {isExpanded && renderFolderTree(folder.id, level + 1)}
            </div>
          );
        })}
        {childRanges.map(range => {
          const isDragging = draggedItem?.type === 'range' && draggedItem.id === range.id;
          const isRangeDropTarget = dropTarget?.type === 'range' && dropTarget.id === parentId && draggedItem?.id !== range.id;

          return (
            <div
              key={range.id}
              draggable
              onDragStart={(e) => handleDragStart(e, 'range', range.id, range.folderId)}
              onDragOver={(e) => handleDragOver(e, 'range', range.id, parentId)}
              onDrop={(e) => handleDrop(e, 'range', range.id, parentId)}
              onDragEnd={handleDragEnd}
              onContextMenu={(e) => handleRangeContextMenu(e, range.id)}
              onClick={(e) => handleRangeClick(e, range.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors
                ${currentRangeId === range.id ? 'bg-blue-50 border-l-4 border-blue-500' : 'hover:bg-slate-100'}
                ${isDragging ? 'opacity-50' : ''}
                ${isRangeDropTarget ? 'bg-green-50 border-l-4 border-green-400' : ''}`}
              style={{ paddingLeft: `${level * 16 + 44}px` }}
            >
              <LayoutGrid size={16} className="text-green-500 flex-shrink-0" />
              <span className="text-sm text-slate-700 truncate flex-1">{range.name}</span>
            </div>
          );
        })}
      </>
    );
  };

  const closeContextMenu = () => {
    setContextMenu(null);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white">
      <div className="p-4 border-b border-slate-200 flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-800">My Ranges</h2>
        <button
          onClick={onClose}
          className="lg:hidden p-2 hover:bg-slate-100 rounded-lg"
        >
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {renderFolderTree(null)}
      </div>

      {creatingFolder && (
        <div className="p-4 border-t border-slate-200 bg-slate-50">
          <form onSubmit={handleFolderCreate} className="space-y-2">
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Folder name..."
              className="w-full px-3 py-2 border-2 border-slate-300 rounded-lg
                         focus:border-blue-500 focus:outline-none text-sm"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setCreatingFolder(false);
                  setNewFolderName('');
                }}
                className="flex-1 px-3 py-2 bg-slate-200 text-slate-700 rounded-lg
                           text-sm font-semibold hover:bg-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-3 py-2 bg-blue-500 text-white rounded-lg
                           text-sm font-semibold hover:bg-blue-600"
              >
                Create
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="p-3 border-t border-slate-200 space-y-2">
        <button
          onClick={() => setCreatingFolder(true)}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-500
                     text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors"
        >
          <FolderPlus size={20} />
          New Folder
        </button>
        <button
          onClick={() => onNewRange(currentFolderId)}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-500
                     text-white rounded-lg font-semibold hover:bg-green-600 transition-colors"
        >
          <LayoutGrid size={20} />
          New Range
        </button>
      </div>
    </div>
  );

  return (
    <>
      <div className="hidden lg:block lg:w-64 border-r border-slate-200 h-screen sticky top-0" ref={containerRef}>
        {sidebarContent}
      </div>

      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black bg-opacity-50" onClick={onClose} />
          <div className="w-80 max-w-[85vw] h-full" ref={containerRef}>
            {sidebarContent}
          </div>
        </div>
      )}

      {contextMenu && contextMenuRangeId && (
        <div
          className="fixed bg-white rounded-lg shadow-xl border border-slate-200 z-50
                     animate-in fade-in duration-150"
          style={{
            left: `${Math.min(contextMenu.x, window.innerWidth - 180)}px`,
            top: `${contextMenu.y}px`,
          }}
        >
          <button
            onClick={handleEditClick}
            className="w-full px-4 py-2 text-left hover:bg-blue-50 text-slate-700
                       font-semibold transition-colors flex items-center gap-2
                       border-b border-slate-100"
          >
            <Edit2 size={16} />
            Open
          </button>
          <button
            onClick={handleDuplicateClick}
            className="w-full px-4 py-2 text-left hover:bg-blue-50 text-slate-700
                       font-semibold transition-colors flex items-center gap-2
                       border-b border-slate-100"
          >
            <Copy size={16} />
            Duplicate
          </button>
          <button
            onClick={handleDeleteClick}
            className="w-full px-4 py-2 text-left hover:bg-red-50 text-red-600
                       font-semibold transition-colors flex items-center gap-2"
          >
            <Trash2 size={16} />
            Delete
          </button>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm mx-4 animate-in fade-in zoom-in duration-200">
            <h3 className="text-lg font-bold text-slate-800 mb-2">
              Delete Range?
            </h3>
            <p className="text-slate-600 mb-6">
              Are you sure you want to delete this range? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg
                           font-semibold hover:bg-slate-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-lg
                           font-semibold hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {contextMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={closeContextMenu}
        />
      )}
    </>
  );
}
