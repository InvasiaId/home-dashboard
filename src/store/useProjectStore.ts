import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Difficulty = 'EASY' | 'HARD';

export interface Project {
  id: string;
  name: string;
  difficulty: Difficulty;
  progress: number;
  createdAt: string;
  completedAt?: string;
  status: 'ACTIVE' | 'COMPLETED';
  link?: string;
}

export interface Reward {
  id: string;
  projectId: string;
  projectName: string;
  difficulty: Difficulty;
  description: string;
  isClaimed: boolean;
  earnedAt: string;
}

interface ProjectStore {
  projects: Project[];
  rewards: Reward[];
  addProject: (name: string, difficulty: Difficulty) => void;
  updateProgress: (id: string, progress: number) => void;
  completeProject: (id: string, link?: string) => void;
  deleteProject: (id: string) => void;
  claimReward: (id: string) => void;
}

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set, get) => ({
      projects: [],
      rewards: [],
      addProject: (name, difficulty) => set((state) => ({
        projects: [
          ...state.projects, 
          {
            id: crypto.randomUUID(),
            name,
            difficulty,
            progress: 0,
            createdAt: new Date().toISOString(),
            status: 'ACTIVE'
          }
        ]
      })),
      updateProgress: (id, progress) => set((state) => ({
        projects: state.projects.map(p => p.id === id ? { ...p, progress } : p)
      })),
      completeProject: (id, link?) => set((state) => {
        const project = state.projects.find(p => p.id === id);
        if (!project) return state;

        const newReward: Reward = {
          id: crypto.randomUUID(),
          projectId: project.id,
          projectName: project.name,
          difficulty: project.difficulty,
          description: project.difficulty === 'EASY' 
            ? 'Checkout beberapa barang (Total under 100k)' 
            : 'Checkout 1 barang (Harga diatas 100k)',
          isClaimed: false,
          earnedAt: new Date().toISOString(),
        };

        return {
          projects: state.projects.map(p => p.id === id ? { 
            ...p, 
            progress: 100, 
            status: 'COMPLETED', 
            completedAt: new Date().toISOString(),
            link
          } : p),
          rewards: [newReward, ...state.rewards]
        };
      }),
      deleteProject: (id) => set((state) => ({
        projects: state.projects.filter(p => p.id !== id)
      })),
      claimReward: (id) => set((state) => ({
        rewards: state.rewards.map(r => r.id === id ? { ...r, isClaimed: !r.isClaimed } : r)
      }))
    }),
    {
      name: 'project-storage',
    }
  )
);
