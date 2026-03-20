import React, { useEffect, useRef, useState } from "react";

const getSequence = (path) => Object.values(
  import.meta.glob("../../assets/sequence_1/*.jpg", { eager: true, query: '?url', import: 'default' })
).sort((a, b) => {
    const aNum = parseInt(a.match(/frame-(\d+)/)?.[1] || "0");
    const bNum = parseInt(b.match(/frame-(\d+)/)?.[1] || "0");
    return aNum - bNum;
});

const SEQ_1 = Object.values(
  import.meta.glob("../../assets/sequence_1/*.jpg", { eager: true, query: '?url', import: 'default' })
).sort((a, b) => {
    const aNum = parseInt(a.match(/frame-(\d+)/)?.[1] || "0");
    const bNum = parseInt(b.match(/frame-(\d+)/)?.[1] || "0");
    return aNum - bNum;
});

const SEQ_2 = Object.values(
  import.meta.glob("../../assets/sequence_2/*.jpg", { eager: true, query: '?url', import: 'default' })
).sort((a, b) => {
    const aNum = parseInt(a.match(/frame-(\d+)/)?.[1] || "0");
    const bNum = parseInt(b.match(/frame-(\d+)/)?.[1] || "0");
    return aNum - bNum;
});

const HERO_IMAGES = [...SEQ_1, ...SEQ_2];

export default function ScrollCanvas({ progress, activeFrame }) {
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

  // Draw current frame
  useEffect(() => {
    if (!loaded || !canvasRef.current || images.length === 0) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    
    // Calculate index: Use explicit activeFrame if provided, otherwise derive from progress
    let index = 0;
    if (typeof activeFrame === 'number') {
      index = Math.min(images.length - 1, Math.max(0, activeFrame));
    } else {
      index = Math.min(images.length - 1, Math.max(0, Math.floor(progress * (images.length - 1))));
    }
    
    const img = images[index];

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
    }
  }, [progress, activeFrame, loaded, images]);

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
