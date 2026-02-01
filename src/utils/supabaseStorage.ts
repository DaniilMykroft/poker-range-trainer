import { supabase } from '../lib/supabase';
import { Folder, SavedRange } from '../types/poker';

export async function loadFolders(): Promise<Folder[]> {
  const { data, error } = await supabase
    .from('folders')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error loading folders:', error);
    return [];
  }

  return data.map(folder => ({
    id: folder.id,
    name: folder.name,
    parentId: folder.parent_id,
    createdAt: folder.created_at
  }));
}

export async function saveFolder(folder: Omit<Folder, 'id' | 'createdAt'>): Promise<Folder | null> {
  const { data, error } = await supabase
    .from('folders')
    .insert({
      name: folder.name,
      parent_id: folder.parentId
    })
    .select()
    .maybeSingle();

  if (error) {
    console.error('Error saving folder:', error);
    return null;
  }

  if (!data) return null;

  return {
    id: data.id,
    name: data.name,
    parentId: data.parent_id,
    createdAt: data.created_at
  };
}

export async function loadRangesFromSupabase(): Promise<SavedRange[]> {
  try {
    const { data, error } = await supabase
      .from('ranges')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error loading ranges:', error);
      return [];
    }

    if (!data) {
      console.warn('No data returned from ranges table');
      return [];
    }

    console.log('Loaded ranges from Supabase:', data.length);

    return data.map(range => ({
      id: range.id,
      name: range.name,
      folderId: range.folder_id,
      cells: range.cells,
      actions: range.actions,
      createdAt: range.created_at
    }));
  } catch (error) {
    console.error('Exception loading ranges:', error);
    return [];
  }
}

export async function saveRangeToSupabase(range: Omit<SavedRange, 'id' | 'createdAt'>): Promise<SavedRange | null> {
  const { data, error } = await supabase
    .from('ranges')
    .insert({
      name: range.name,
      folder_id: range.folderId,
      cells: range.cells,
      actions: range.actions
    })
    .select()
    .maybeSingle();

  if (error) {
    console.error('Error saving range:', error);
    return null;
  }

  if (!data) return null;

  return {
    id: data.id,
    name: data.name,
    folderId: data.folder_id,
    cells: data.cells,
    actions: data.actions,
    createdAt: data.created_at
  };
}

export async function updateRangeToSupabase(rangeId: string, range: Omit<SavedRange, 'id' | 'createdAt'>): Promise<SavedRange | null> {
  const { data, error } = await supabase
    .from('ranges')
    .update({
      name: range.name,
      folder_id: range.folderId,
      cells: range.cells,
      actions: range.actions
    })
    .eq('id', rangeId)
    .select()
    .maybeSingle();

  if (error) {
    console.error('Error updating range:', error);
    return null;
  }

  if (!data) return null;

  return {
    id: data.id,
    name: data.name,
    folderId: data.folder_id,
    cells: data.cells,
    actions: data.actions,
    createdAt: data.created_at
  };
}

export async function deleteRangeFromSupabase(rangeId: string): Promise<boolean> {
  const { error } = await supabase
    .from('ranges')
    .delete()
    .eq('id', rangeId);

  if (error) {
    console.error('Error deleting range:', error);
    return false;
  }

  return true;
}

export async function deleteFolderFromSupabase(folderId: string): Promise<boolean> {
  const { error } = await supabase
    .from('folders')
    .delete()
    .eq('id', folderId);

  if (error) {
    console.error('Error deleting folder:', error);
    return false;
  }

  return true;
}

export async function updateFolderParent(folderId: string, newParentId: string | null): Promise<boolean> {
  const { error } = await supabase
    .from('folders')
    .update({ parent_id: newParentId })
    .eq('id', folderId);

  if (error) {
    console.error('Error updating folder parent:', error);
    return false;
  }

  return true;
}

export async function updateRangeFolder(rangeId: string, newFolderId: string | null): Promise<boolean> {
  const { error } = await supabase
    .from('ranges')
    .update({ folder_id: newFolderId })
    .eq('id', rangeId);

  if (error) {
    console.error('Error updating range folder:', error);
    return false;
  }

  return true;
}
