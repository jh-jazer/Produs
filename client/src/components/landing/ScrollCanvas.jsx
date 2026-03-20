import React, { useEffect, useRef, useState } from "react";

const HERO_IMAGES = Object.values(
  import.meta.glob("../../assets/hero_sequence/*.jpg", { eager: true, query: '?url', import: 'default' })
).sort((a, b) => {
    const aNum = parseInt(a.match(/frame-(\d+)/)?.[1] || "0");
    const bNum = parseInt(b.match(/frame-(\d+)/)?.[1] || "0");
    return aNum - bNum;
});

export default function ScrollCanvas({ progress }) {
  const canvasRef = useRef(null);
  const [images, setImages] = useState([]);
  const [loaded, setLoaded] = useState(false);

  // Preload Images
  useEffect(() => {
    const loadedImages = [];
    let loadedCount = 0;

    HERO_IMAGES.forEach((src, i) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        loadedCount++;
        if (loadedCount === HERO_IMAGES.length) {
          setLoaded(true);
        }
      };
      loadedImages[i] = img;
    });
    setImages(loadedImages);
  }, []);

  // Draw current frame on progress change
  useEffect(() => {
    if (!loaded || !canvasRef.current || images.length === 0) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    
    // Calculate index
    const index = Math.min(images.length - 1, Math.max(0, Math.floor(progress * (images.length - 1))));
    const img = images[index];

    if (img) {
      // Clear and draw
      context.clearRect(0, 0, canvas.width, canvas.height);
      
      // Cover logic (Object-fit: cover)
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
    }
  }, [progress, loaded, images]);

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
    <div className="absolute inset-0 z-0 overflow-hidden bg-black">
      <canvas 
        ref={canvasRef} 
        className="w-full h-full object-cover"
        style={{ filter: "brightness(0.4) saturate(0.8)" }}
      />
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-black z-50">
           <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}
