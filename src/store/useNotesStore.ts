import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

interface NotesStore {
  notes: Note[];
  addNote: (title: string, content: string) => void;
  updateNote: (id: string, title: string, content: string) => void;
  deleteNote: (id: string) => void;
}

export const useNotesStore = create<NotesStore>()(
  persist(
    (set) => ({
      notes: [],
      addNote: (title, content) => set(state => ({
        notes: [
          {
            id: crypto.randomUUID(),
            title,
            content,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          ...state.notes,
        ]
      })),
      updateNote: (id, title, content) => set(state => ({
        notes: state.notes.map(n => n.id === id ? { ...n, title, content, updatedAt: new Date().toISOString() } : n)
      })),
      deleteNote: (id) => set(state => ({
        notes: state.notes.filter(n => n.id !== id)
      }))
    }),
    {
      name: 'notes-storage'
    }
  )
);
