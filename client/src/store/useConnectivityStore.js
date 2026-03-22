import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const useConnectivityStore = create(
    persist(
        (set, get) => ({
            isOnline: navigator.onLine,
            setOnline: (status) => set({ isOnline: status }),
            lastSyncTimestamp: Date.now(),
            setLastSyncTimestamp: (timestamp) => set({ lastSyncTimestamp: timestamp }),
            isSyncing: false,
            setIsSyncing: (status) => set({ isSyncing: status }),
            
            // Offline Queue for pending mutations
            offlineQueue: [],
            
            addToQueue: (mutation) => set((state) => ({
                offlineQueue: [...state.offlineQueue, { ...mutation, id: Date.now() }]
            })),
            
            removeFromQueue: (id) => set((state) => ({
                offlineQueue: state.offlineQueue.filter(item => item.id !== id)
            })),
            
            clearQueue: () => set({ offlineQueue: [] }),
        }),
        {
            name: 'connectivity-storage',
            storage: createJSONStorage(() => localStorage),
            // Only persist the queue and sync timestamps
            partialize: (state) => ({ 
                offlineQueue: state.offlineQueue,
                lastSyncTimestamp: state.lastSyncTimestamp 
            }),
        }
    )
);

export default useConnectivityStore;
