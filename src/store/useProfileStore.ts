import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ProfileStore {
  name: string;
  avatarUrl: string;
  updateProfile: (name: string, avatarUrl: string) => void;
}

export const useProfileStore = create<ProfileStore>()(
  persist(
    (set) => ({
      name: 'DevDash User',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
      updateProfile: (name, avatarUrl) => set({ name, avatarUrl })
    }),
    {
      name: 'profile-storage'
    }
  )
);
