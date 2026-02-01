import { useState, useEffect } from 'react';
import { BookOpen, Trophy, Menu } from 'lucide-react';
import RangeEditor from './components/RangeEditor';
import RangeTrainer from './components/RangeTrainer';
import Sidebar from './components/Sidebar';
import { SavedRange, Folder } from './types/poker';
import { loadFolders, saveFolder, loadRangesFromSupabase, saveRangeToSupabase, updateFolderParent, updateRangeFolder } from './utils/supabaseStorage';

type TabType = 'editor' | 'trainer';

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('editor');
  const [savedRanges, setSavedRanges] = useState<SavedRange[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [currentRangeId, setCurrentRangeId] = useState<string | null>(null);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      console.log('Loading data from Supabase...');
      const [rangesData, foldersData] = await Promise.all([
        loadRangesFromSupabase(),
        loadFolders()
      ]);
      console.log('Loaded ranges:', rangesData.length);
      console.log('Loaded folders:', foldersData.length);
      setSavedRanges(rangesData);
      setFolders(foldersData);
    };
    loadData();
  }, []);

  const handleRangeSave = async (range: Omit<SavedRange, 'id' | 'createdAt'>) => {
    const savedRange = await saveRangeToSupabase(range);
    if (savedRange) {
      setSavedRanges([...savedRanges, savedRange]);
      alert(`Range "${savedRange.name}" saved successfully!`);
    } else {
      alert('Failed to save range');
    }
  };

  const handleFolderCreate = async (name: string, parentId: string | null) => {
    const savedFolder = await saveFolder({ name, parentId });
    if (savedFolder) {
      setFolders([...folders, savedFolder]);
    } else {
      alert('Failed to create folder');
    }
  };

  const handleRangeSelect = (rangeId: string) => {
    setCurrentRangeId(rangeId);
    setSidebarOpen(false);
  };

  const handleNewRange = (folderId: string | null) => {
    setCurrentRangeId(null);
    setActiveTab('editor');
    setSidebarOpen(false);
  };

  const handleMoveFolder = async (folderId: string, newParentId: string | null) => {
    const success = await updateFolderParent(folderId, newParentId);
    if (success) {
      setFolders(folders.map(f =>
        f.id === folderId ? { ...f, parentId: newParentId } : f
      ));
    } else {
      alert('Failed to move folder');
    }
  };

  const handleMoveRange = async (rangeId: string, newFolderId: string | null) => {
    const success = await updateRangeFolder(rangeId, newFolderId);
    if (success) {
      setSavedRanges(savedRanges.map(r =>
        r.id === rangeId ? { ...r, folderId: newFolderId } : r
      ));
    } else {
      alert('Failed to move range');
    }
  };

  const handleFolderClick = (folderId: string | null) => {
    setCurrentFolderId(folderId);
  };

  const handleEditRange = (range: SavedRange) => {
    setCurrentRangeId(range.id);
    setActiveTab('editor');
    setSidebarOpen(false);
  };

  const handleDuplicateRange = async (range: SavedRange) => {
    const newName = `${range.name} (Copy)`;
    const duplicatedRange = await saveRangeToSupabase({
      name: newName,
      cells: range.cells,
      actions: range.actions,
      folderId: range.folderId
    });

    if (duplicatedRange) {
      setSavedRanges([...savedRanges, duplicatedRange]);
      alert(`Range "${newName}" duplicated successfully!`);
    } else {
      alert('Failed to duplicate range');
    }
  };

  const handleDeleteRange = (rangeId: string) => {
    setSavedRanges(savedRanges.filter(r => r.id !== rangeId));
    if (currentRangeId === rangeId) {
      setCurrentRangeId(null);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200">
      <Sidebar
        folders={folders}
        ranges={savedRanges}
        currentRangeId={currentRangeId}
        currentFolderId={currentFolderId}
        onFolderCreate={handleFolderCreate}
        onRangeSelect={handleRangeSelect}
        onNewRange={handleNewRange}
        onMoveFolder={handleMoveFolder}
        onMoveRange={handleMoveRange}
        onFolderClick={handleFolderClick}
        onEditRange={handleEditRange}
        onDuplicateRange={handleDuplicateRange}
        onDeleteRange={handleDeleteRange}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-lg border-b-4 border-blue-500">
          <div className="px-4 py-6">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 hover:bg-slate-100 rounded-lg"
              >
                <Menu size={24} className="text-slate-700" />
              </button>
              <h1 className="text-3xl lg:text-4xl font-bold text-slate-800 flex-1 text-center">
                🃏 Poker Range Trainer
              </h1>
              <div className="lg:hidden w-10" />
            </div>

            <nav className="flex gap-2 justify-center">
              <button
                className={`
                  px-6 lg:px-8 py-3 rounded-lg font-semibold text-base lg:text-lg transition-all duration-200
                  flex items-center gap-2
                  ${activeTab === 'editor'
                    ? 'bg-blue-500 text-white shadow-lg scale-105'
                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                  }
                `}
                onClick={() => setActiveTab('editor')}
              >
                <BookOpen size={20} />
                Editor
              </button>
              <button
                className={`
                  px-6 lg:px-8 py-3 rounded-lg font-semibold text-base lg:text-lg transition-all duration-200
                  flex items-center gap-2
                  ${activeTab === 'trainer'
                    ? 'bg-blue-500 text-white shadow-lg scale-105'
                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                  }
                `}
                onClick={() => setActiveTab('trainer')}
              >
                <Trophy size={20} />
                Trainer
              </button>
            </nav>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-4 py-8">
          {activeTab === 'editor' ? (
            <RangeEditor onRangeSave={handleRangeSave} currentFolderId={currentFolderId} />
          ) : (
            <RangeTrainer
              savedRanges={savedRanges}
              onEditRange={handleEditRange}
              onDuplicateRange={handleDuplicateRange}
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
