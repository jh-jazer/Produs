import { create } from 'zustand';

export const useAssetStore = create((set, get) => ({
  heroImages: [],
  isHeroLoaded: false,
  heroLoadingProgress: 0,

  preloadHeroImages: (sources) => {
    const { heroImages, isHeroLoaded } = get();
    
    // If already loading or loaded, don't repeat
    if (heroImages.length > 0 || isHeroLoaded) return;

    const loadedImages = [];
    let loadedCount = 0;

    sources.forEach((src, i) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        loadedCount++;
        const progress = Math.floor((loadedCount / sources.length) * 100);
        set({ heroLoadingProgress: progress });

        if (loadedCount === sources.length) {
          set({ isHeroLoaded: true, heroImages: loadedImages });
        }
      };
      loadedImages[i] = img;
    });
  }
}));
