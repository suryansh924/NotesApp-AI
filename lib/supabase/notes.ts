import { Note } from '@/lib/stores/notesSlice';
import { createClient } from './client';

type NoteWithId = Omit<Note, 'id'> & { id?: string };

const supabase = createClient();

// Fetch all notes for the current user
export const fetchNotes = async () => {
  const { data: notes, error } = await supabase
    .from('notes')
    .select('*')
    .order('updatedAt', { ascending: false });

  if (error) {
    throw error;
  }

  return notes as Note[];
};

// Create a new note
export const createNote = async (note: NoteWithId) => {
  const { data, error } = await supabase
    .from('notes')
    .insert([note])
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data as Note;
};

// Update an existing note
export const updateNote = async (id: string, note: Partial<Note>) => {
  console.log('Updating note with ID:', id, 'and data:', note);
  
  // First check if the note exists
  const { data: existingNote, error: fetchError } = await supabase
    .from('notes')
    .select()
    .eq('id', String(id))
    .single();
  
  if (fetchError) {
    console.error('Error checking if note exists:', fetchError);
    throw fetchError;
  }
  
  if (!existingNote) {
    console.error('Note not found with ID:', id);
    throw new Error(`Note with ID ${id} not found`);
  }
  
  console.log('Found note to update:', existingNote);
  
  // Format update data - ensure all fields are properly formatted
  const updateData = {
    ...note,
    updatedAt: new Date().toISOString()
  };
  
  console.log('Update payload:', updateData);
  
  // Then update the note
  const { data, error } = await supabase
    .from('notes')
    .update(updateData)
    .eq('id', String(id))
    .select();

  if (error) {
    console.error('Supabase update error:', error);
    throw error;
  }
  
  console.log('Raw update response:', data);
  
  // Try to fetch the updated note to confirm the changes
  const { data: refreshedNote, error: refreshError } = await supabase
    .from('notes')
    .select()
    .eq('id', String(id))
    .single();
    
  if (refreshError) {
    console.error('Error fetching updated note:', refreshError);
  } else {
    console.log('Freshly fetched note after update:', refreshedNote);
  }

  // Return the updated note or the original with applied changes as fallback
  if (data && data.length > 0) {
    console.log('Returning data from update operation');
    return data[0] as Note;
  } else if (refreshedNote) {
    console.log('Returning freshly fetched note');
    return refreshedNote as Note;
  } else {
    console.log('Returning manually updated note');
    return {
      ...existingNote,
      ...note,
      updatedAt: new Date().toISOString()
    } as Note;
  }
};

// Delete a note
export const deleteNote = async (id: string) => {
  console.log('Attempting to delete note with ID:', id);
  
  // First check if the note exists
  const { data: existingNote, error: fetchError } = await supabase
    .from('notes')
    .select()
    .eq('id', String(id))
    .single();
  
  if (fetchError) {
    console.error('Error checking if note exists:', fetchError);
    throw fetchError;
  }
  
  if (!existingNote) {
    console.error('Note not found with ID:', id);
    throw new Error(`Note with ID ${id} not found`);
  }
  
  console.log('Found note to delete:', existingNote);
  
  // Then delete the note
  const { error } = await supabase
    .from('notes')
    .delete()
    .eq('id', String(id));

  if (error) {
    console.error('Error deleting note:', error);
    throw error;
  }

  console.log('Note deleted successfully with ID:', id);
  return id;
};