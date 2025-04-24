import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  isPrivate: boolean;
  user_id: string;
}

interface NotesState {
  notes: Note[];
}

const initialState: NotesState = {
  notes: [],
};

export const notesSlice = createSlice({
  name: 'notes',
  initialState,
  reducers: {
    addNote: (state, action: PayloadAction<Omit<Note, 'id'>>) => {
      const id = crypto.randomUUID();
      state.notes.push({
        ...action.payload,
        id,
      });
    },
    updateNote: (state, action: PayloadAction<{ id: string; note: Partial<Note> }>) => {
      const { id, note } = action.payload;
      const index = state.notes.findIndex((n) => n.id === id);
      if (index !== -1) {
        state.notes[index] = {
          ...state.notes[index],
          ...note,
          updatedAt: new Date().toISOString(),
        };
      }
    },
    deleteNote: (state, action: PayloadAction<string>) => {
      state.notes = state.notes.filter((note) => note.id !== action.payload);
    },
  },
});

export const { addNote, updateNote, deleteNote } = notesSlice.actions;
export default notesSlice.reducer;