import { create } from 'zustand';
import { User, MediaItem, GenerationResult } from '@/types';

interface AppState {
  // Auth
  user: User | null;
  isAuthenticated: boolean;
  
  // Media
  mediaItems: MediaItem[];
  selectedMedia: MediaItem | null;
  
  // Generation
  currentGeneration: GenerationResult | null;
  isGenerating: boolean;
  
  // Actions - Auth
  setUser: (user: User | null) => void;
  logout: () => void;
  
  // Actions - Media
  setMediaItems: (items: MediaItem[]) => void;
  addMediaItem: (item: MediaItem) => void;
  setSelectedMedia: (item: MediaItem | null) => void;
  removeMediaItem: (id: string) => void;
  updateMediaItem: (id: string, updates: Partial<MediaItem>) => void;
  
  // Actions - Generation
  setCurrentGeneration: (generation: GenerationResult | null) => void;
  setIsGenerating: (value: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Initial state
  user: null,
  isAuthenticated: false,
  mediaItems: [],
  selectedMedia: null,
  currentGeneration: null,
  isGenerating: false,
  
  // Auth actions
  setUser: (user) =>
    set({
      user,
      isAuthenticated: !!user,
    }),
    
  logout: () =>
    set({
      user: null,
      isAuthenticated: false,
      mediaItems: [],
      selectedMedia: null,
      currentGeneration: null,
    }),
  
  // Media actions
  setMediaItems: (items) =>
    set({ mediaItems: items }),
    
  addMediaItem: (item) =>
    set((state) => ({
      mediaItems: [item, ...state.mediaItems],
    })),
    
  setSelectedMedia: (item) =>
    set({ selectedMedia: item }),
    
  removeMediaItem: (id) =>
    set((state) => ({
      mediaItems: state.mediaItems.filter((item) => item.id !== id),
      selectedMedia: state.selectedMedia?.id === id ? null : state.selectedMedia,
    })),
    
  updateMediaItem: (id, updates) =>
    set((state) => ({
      mediaItems: state.mediaItems.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      ),
      selectedMedia:
        state.selectedMedia?.id === id
          ? { ...state.selectedMedia, ...updates }
          : state.selectedMedia,
    })),
  
  // Generation actions
  setCurrentGeneration: (generation) =>
    set({ currentGeneration: generation }),
    
  setIsGenerating: (value) =>
    set({ isGenerating: value }),
}));
