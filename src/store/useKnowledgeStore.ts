import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Knowledge {
  id: string;
  title: string;
  description: string;
  date: string; // ISO date string
}

interface KnowledgeStore {
  knowledges: Knowledge[];
  addKnowledge: (title: string, description: string) => void;
  deleteKnowledge: (id: string) => void;
}

export const useKnowledgeStore = create<KnowledgeStore>()(
  persist(
    (set) => ({
      knowledges: [],
      addKnowledge: (title, description) => set((state) => ({
        knowledges: [
          ...state.knowledges,
          {
            id: crypto.randomUUID(),
            title,
            description,
            date: new Date().toISOString(),
          }
        ]
      })),
      deleteKnowledge: (id) => set((state) => ({
        knowledges: state.knowledges.filter(k => k.id !== id)
      }))
    }),
    {
      name: 'knowledge-storage'
    }
  )
);
