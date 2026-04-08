/* eslint-disable */
import React, { useEffect, useRef } from "react";
import { useAssetStore } from "../../store/useAssetStore";

const SEQ_1 = Object.values(
  import.meta.glob("../../assets/sequence_1/*.jpg", { eager: true, import: 'default' })
).sort((a, b) => {
    const aNum = parseInt(a.match(/frame-(\d+)/)?.[1] || "0");
    const bNum = parseInt(b.match(/frame-(\d+)/)?.[1] || "0");
    return aNum - bNum;
});

const HERO_IMAGES = SEQ_1;

export default function ScrollCanvas({ progress, activeFrame }) {
  const canvasRef = useRef(null);
  const { heroImages, isHeroLoaded, preloadHeroImages } = useAssetStore();

  // Preload Images into Global Cache
  useEffect(() => {
    preloadHeroImages(HERO_IMAGES);
  }, [preloadHeroImages]);

  // Draw current frame
  useEffect(() => {
    if (!isHeroLoaded || !canvasRef.current || heroImages.length === 0) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    
    // Calculate sequence rhythm: Forward -> Black Gap -> Reverse
    const BLACK_GAP = 0;
    const seqLen = heroImages.length;
    const totalFrames = seqLen * 2 + BLACK_GAP;
    
    // Determine frame index 
    let frameIndex = 0;
    if (typeof activeFrame === 'number') {
      frameIndex = Math.min(totalFrames - 1, Math.max(0, activeFrame));
    } else {
      frameIndex = Math.min(totalFrames - 1, Math.max(0, Math.floor(progress * (totalFrames - 1))));
    }
    
    // Select Image or Black State
    let img = null;
    if (frameIndex < seqLen) {
      img = heroImages[frameIndex];
    } else if (frameIndex >= seqLen + BLACK_GAP) {
      // Reverse logic: totalFrames - 1 - frameIndex
      // e.g. if total is 440, gap is 20, seq is 210.
      // If index is 230 (start of reverse): 440 - 1 - 230 = 209 (correct, last frame)
      img = heroImages[totalFrames - 1 - frameIndex];
    }

    if (img) {
      context.clearRect(0, 0, canvas.width, canvas.height);
      const canvasAspect = canvas.width / canvas.height;
      const imgAspect = img.width / img.height;
      let drawWidth, drawHeight, offsetX, offsetY;

      if (canvasAspect > imgAspect) {
        drawWidth = canvas.width;
        drawHeight = canvas.width / imgAspect;
        offsetX = 0;
        offsetY = (canvas.height - drawHeight) / 2;
      } else {
        drawWidth = canvas.height * imgAspect;
        drawHeight = canvas.height;
        offsetX = (canvas.width - drawWidth) / 2;
        offsetY = 0;
      }
      context.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
    } else {
      // THE VOID: Theme-aware transition
      context.fillStyle = "#000"; // Always use black, as the invert filter in light mode will turn it white-ish
      context.fillRect(0, 0, canvas.width, canvas.height);
    }
  }, [progress, activeFrame, isHeroLoaded, heroImages]);

  // Handle Resize
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth * window.devicePixelRatio;
        canvasRef.current.height = window.innerHeight * window.devicePixelRatio;
      }
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-black transition-colors duration-1000">
      <canvas 
        ref={canvasRef} 
        className="w-full h-full object-cover transition-all duration-1000"
        style={{ filter: "brightness(0.4) saturate(0.8)" }}
      />
    </div>
  );
}
