"use client";

import { useScroll, useSpring, useTransform, MotionValue, motion } from "framer-motion";
import { useEffect, useRef, useState, useMemo } from "react";

const FRAME_COUNT = 240;
const CANVAS_WIDTH = 1920;
const CANVAS_HEIGHT = 1080;

type FrameData = {
  img: HTMLImageElement | null;
  loaded: boolean;
};

export default function HeadphoneScroll() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [images, setImages] = useState<FrameData[]>([]);
  const [imagesLoaded, setImagesLoaded] = useState(0);

  // Scroll progress for the entire container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 200, // Slightly stiffer for more responsive feel
    damping: 30, // Good damping to prevent overshoot but stay smooth
    restDelta: 0.001,
  });

  // Load images
  useEffect(() => {
    // Generate filenames
    const loadImages = async () => {
      const imgs: FrameData[] = [];
      const promises: Promise<void>[] = [];

      for (let i = 1; i <= FRAME_COUNT; i++) {
        const paddedIndex = i.toString().padStart(3, "0");
        const src = `/frames/ezgif-frame-${paddedIndex}.jpg`;
        
        const img = new Image();
        
        const promise = new Promise<void>((resolve) => {
          img.onload = () => {
            setImagesLoaded((prev) => prev + 1);
            resolve();
          };
          img.onerror = () => {
             // Fallback or skip
             console.error(`Failed to load frame ${i}`);
             resolve();
          };
        });

        img.src = src;
        promises.push(promise);
        imgs.push({ img, loaded: false });
      }

      setImages(imgs);
      await Promise.all(promises);
    };

    loadImages();
  }, []);

  // Sync canvas with scroll
  useEffect(() => {
    const render = () => {
      const canvas = canvasRef.current;
      const progress = smoothProgress.get();
      
      // Map progress 0-1 to frame index 0-239
      const frameIndex = Math.min(
        FRAME_COUNT - 1,
        Math.floor(progress * (FRAME_COUNT - 1))
      );

      // We need to access the image from the array we created logic for
      // But since we can't easily access the loaded `images` state inside this animation frame loop reliably without ref or dependency
      // Actually, we can just start drawing when images are ready.
      // Better approach: Re-draw when progress changes or when images load
    };
    
    // We will use MotionValue.on("change") to drive the render loop
    // to avoid a constant requestAnimationFrame when not scrolling.
    
    return smoothProgress.on("change", (latest) => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
        if (!canvas || !ctx) return;

        const frameIndex = Math.min(
            FRAME_COUNT - 1,
            Math.floor(latest * (FRAME_COUNT - 1))
        );
        
        // Construct the image object or get it from a ref if we stored it
        // Re-creating image objects here is bad for perf.
        // We should use the state. 
        // To access latest state in this callback, we need a ref.
    });
  }, [smoothProgress]); 

  // Re-implementing the render logic with a ref for images to access them inside the callback
  const imagesRef = useRef<HTMLImageElement[]>([]);
  useEffect(() => {
      // Preload images into the ref
      const loadParams = async () => {
          const loadedImages: HTMLImageElement[] = new Array(FRAME_COUNT).fill(null);
          let count = 0;
          
          for(let i=0; i<FRAME_COUNT; i++) {
             const img = new Image();
             const paddedIndex = (i+1).toString().padStart(3, "0");
             img.src = `/frames/ezgif-frame-${paddedIndex}.jpg`;
             img.onload = () => {
                count++;
                setImagesLoaded(count);
             };
             loadedImages[i] = img;
          }
          imagesRef.current = loadedImages;
      };
      
      loadParams();
  }, []);

  // Draw function
  const drawImage = (index: number) => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      const img = imagesRef.current[index];

      if (!canvas || !ctx || !img || !img.complete) return;

      // Clear
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw - Scale to cover or contain logic?
      // User asked for "contain fit" for mobile, but usually for these backgrounds we want "cover" 
      // EXCEPT user specifically said "seamless blending... background color match".
      // So "contain" is safer to avoid cropping the product if background matches.
      // However, usually high-end product pages use "cover" to fill the screen.
      // Let's implement a smart "contain" that centers it.
      
      // Drawing 1920x1080 image to canvas of variable size
      const hRatio = canvas.width / img.width;
      const vRatio = canvas.height / img.height;
      
      // User requested "full space" on mobile, so we switch to COVER strategy (Math.max)
      // This ensures no letterboxing, the image fills the screen.
      // Since background is uniform, this is safe.
      const ratio = Math.max(hRatio, vRatio);
      
      const centerShift_x = (canvas.width - img.width * ratio) / 2;
      const centerShift_y = (canvas.height - img.height * ratio) / 2;
      
      ctx.drawImage(
        img,
        0,
        0,
        img.width,
        img.height,
        centerShift_x,
        centerShift_y,
        img.width * ratio,
        img.height * ratio
      );
  };

  // Resize handler
  useEffect(() => {
    const handleResize = () => {
        if(canvasRef.current) {
            canvasRef.current.width = window.innerWidth;
            canvasRef.current.height = window.innerHeight;
            // Redraw current frame
            const startProgress = smoothProgress.get();
            const frameIndex = Math.min(
                FRAME_COUNT - 1,
                Math.floor(startProgress * (FRAME_COUNT - 1))
            );
            drawImage(frameIndex);
        }
    };
    
    window.addEventListener("resize", handleResize);
    handleResize(); // Init
    
    return () => window.removeEventListener("resize", handleResize);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps


  // Subscribe to updates
  useEffect(() => {
    return smoothProgress.on("change", (latest) => {
        const frameIndex = Math.min(
            FRAME_COUNT - 1,
            Math.floor(latest * (FRAME_COUNT - 1))
        );
        requestAnimationFrame(() => drawImage(frameIndex));
    });
  }, []);

    // Initial draw when loaded
    useEffect(() => {
        if (imagesLoaded === FRAME_COUNT) {
             drawImage(0);
        }
    }, [imagesLoaded]);


  const isLoading = imagesLoaded < FRAME_COUNT;

  return (
    <div ref={containerRef} className="relative h-[400vh] bg-[#050505]">
      {/* Loading State */}
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#050505] text-white">
          <div className="flex flex-col items-center gap-4">
             <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
             <p className="text-sm font-light tracking-widest opacity-60">
               LOADING EXPERIENCE {Math.round((imagesLoaded / FRAME_COUNT) * 100)}%
             </p>
          </div>
        </div>
      )}

      {/* Sticky Canvas - Use dvh for mobile address bar handling */}
      <div className="sticky top-0 h-[100dvh] w-full overflow-hidden">
        <canvas
          ref={canvasRef}
          className="block h-full w-full object-cover"
        />
      </div>

      {/* Overlays */}
      <OverlayScroll progress={smoothProgress} />
    </div>
  );
}

function OverlayScroll({ progress }: { progress: MotionValue<number> }) {
    // Opacity transforms
    const opacity1 = useTransform(progress, [0, 0.15, 0.25], [1, 1, 0]);
    const y1 = useTransform(progress, [0, 0.25], [0, -50]);
    
    const opacity2 = useTransform(progress, [0.25, 0.35, 0.45], [0, 1, 0]);
    const y2 = useTransform(progress, [0.25, 0.45], [50, -50]);
    
    const opacity3 = useTransform(progress, [0.55, 0.65, 0.75], [0, 1, 0]);
    const y3 = useTransform(progress, [0.55, 0.75], [50, -50]);
    
    const opacity4 = useTransform(progress, [0.85, 0.95, 1], [0, 1, 1]);
    const y4 = useTransform(progress, [0.85, 1], [50, 0]);
    
    return (
        <div className="pointer-events-none fixed inset-0 z-10 mx-auto max-w-[1400px] px-6">
            {/* Section 1: Intro */}
            <motion.div 
                style={{ opacity: opacity1, y: y1 }}
                className="absolute inset-x-0 top-[35%] md:top-[40%] text-center px-4"
            >
                <h1 className="text-5xl md:text-8xl font-bold tracking-tight text-white/90">
                    Real X.
                </h1>
                <p className="mt-4 text-base md:text-xl tracking-widest text-white/60">UNLIMITED POWER</p>
            </motion.div>

             {/* Section 2: Left */}
             <motion.div 
                style={{ opacity: opacity2, y: y2 }}
                className="absolute left-0 right-0 md:right-auto md:left-24 top-[40%] md:top-[45%] text-center md:text-left px-6"
            >
                <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-white/90">
                    20,000mAh<br/>Capacity.
                </h2>
            </motion.div>

            {/* Section 3: Right */}
             <motion.div 
                style={{ opacity: opacity3, y: y3 }}
                className="absolute left-0 right-0 md:left-auto md:right-24 top-[40%] md:top-[45%] text-center md:text-right px-6"
            >
                <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-white/90">
                    140W<br/>Output.
                </h2>
            </motion.div>

            {/* Section 4: CTA */}
             <motion.div 
                style={{ opacity: opacity4, y: y4 }}
                className="absolute inset-x-0 top-[35%] md:top-[40%] flex flex-col items-center text-center px-4"
            >
                <h2 className="text-4xl md:text-7xl font-bold tracking-tight text-white/90">
                    Charge Anything.
                </h2>
                <button className="pointer-events-auto mt-8 rounded-full bg-white px-6 py-3 md:px-8 md:py-4 text-sm font-medium tracking-wide text-black transition-transform hover:scale-105 active:scale-95">
                    PRE-ORDER NOW
                </button>
            </motion.div>
        </div>
    );
}
