import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchNotes, createNote, updateNote as updateNoteApi, deleteNote as deleteNoteApi } from '@/lib/supabase/notes';
import { Note } from '@/lib/stores/notesSlice';
import { toast } from 'sonner';

export const useNotes = () => {
  const queryClient = useQueryClient();

  // Fetch all notes
  const { data: notes = [], isLoading, error, refetch } = useQuery({
    queryKey: ['notes'],
    queryFn: fetchNotes,
    staleTime: 1000, // Consider data fresh for just 1 second to ensure frequent refreshes
  });

  // Create a new note
  const { mutate: addNote } = useMutation({
    mutationFn: createNote,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      toast.success('Note created successfully');
      return data;
    },
    onError: (error) => {
      console.error('Failed to create note:', error);
      toast.error('Failed to create note');
    },
  });

  // Update an existing note with optimistic updates
  const { mutate: updateNote } = useMutation({
    // The mutation function
    mutationFn: async ({ id, note }: { id: string; note: Partial<Note> }) => {
      console.log('useNotes: Updating note with ID:', id);
      return await updateNoteApi(id, note);
    },
    
    // What happens before the mutation is executed
    onMutate: async (variables) => {
      console.log('useNotes: Starting optimistic update');
      
      // Cancel any outgoing refetches to avoid overwriting our optimistic update
      await queryClient.cancelQueries({ queryKey: ['notes'] });
      
      // Snapshot the previous value
      const previousNotes = queryClient.getQueryData(['notes']);
      
      // Optimistically update to the new value
      queryClient.setQueryData(['notes'], (old: Note[] | undefined) => {
        if (!old) return [];
        return old.map(note => {
          if (String(note.id) === String(variables.id)) {
            return { ...note, ...variables.note };
          }
          return note;
        });
      });
      
      // Return the context with the snapshotted value
      return { previousNotes };
    },
    
    // If the mutation succeeds, we don't need to do anything as our cache is already updated
    onSuccess: (updatedNote) => {
      console.log('useNotes: Note successfully updated:', updatedNote);
      toast.success('Note updated successfully');
      
      // Force a refetch with immediate execution
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      queryClient.refetchQueries({ queryKey: ['notes'], type: 'active' });
    },
    
    // If the mutation fails, we use the context we saved to roll back
    onError: (err, variables, context) => {
      console.error('useNotes: Error updating note:', err);
      toast.error('Failed to update note');
      
      if (context?.previousNotes) {
        queryClient.setQueryData(['notes'], context.previousNotes);
      }
    },
  });

  // Delete a note with optimistic updates
  const { mutate: deleteNote } = useMutation({
    // The mutation function
    mutationFn: async (params: { id: string }) => {
      console.log('useNotes: Deleting note with ID:', params.id);
      return await deleteNoteApi(params.id);
    },
    
    // What happens before the mutation is executed
    onMutate: async (variables) => {
      console.log('useNotes: Starting optimistic update for delete');
      
      // Cancel any outgoing refetches to avoid overwriting our optimistic update
      await queryClient.cancelQueries({ queryKey: ['notes'] });
      
      // Snapshot the previous value
      const previousNotes = queryClient.getQueryData(['notes']);
      
      // Optimistically update to the new value
      queryClient.setQueryData(['notes'], (old: Note[] | undefined) => {
        if (!old) return [];
        return old.filter(note => String(note.id) !== String(variables.id));
      });
      
      // Return the context with the snapshotted value
      return { previousNotes };
    },
    
    // If the mutation succeeds, we don't need to do anything as our cache is already updated
    onSuccess: (deletedId) => {
      console.log('useNotes: Note successfully deleted from Supabase:', deletedId);
      toast.success('Note deleted successfully');
      
      // Force a refetch to ensure our data is in sync with the server
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
    
    // If the mutation fails, we use the context we saved to roll back
    onError: (err, variables, context) => {
      console.error('useNotes: Error deleting note:', err);
      toast.error('Failed to delete note');
      
      if (context?.previousNotes) {
        queryClient.setQueryData(['notes'], context.previousNotes);
      }
    },
    
    // Always refetch after error or success to ensure cache sync
    onSettled: () => {
      console.log('useNotes: Delete settled, refetching notes');
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });

  return {
    notes,
    isLoading,
    error,
    refetch,
    addNote,
    updateNote,
    deleteNote,
  };
};