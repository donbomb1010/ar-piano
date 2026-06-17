import { useEffect, useRef, useState, useCallback } from 'react';
import { Camera, Settings2, Maximize2, Play } from 'lucide-react';
import { motion } from 'framer-motion';
import { useHandTracking } from '../hooks/useHandTracking';
import { drawHandLandmarks } from '../utils/drawing';
import { audio } from '../utils/audio';

// --- Keyboard Generation ---
interface PianoKey {
  note: string;
  isBlack: boolean;
  left: number; // 0 to 1
  right: number; // 0 to 1
}

const OCTAVES = [3, 4, 5];
const WHITE_NOTES = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const BLACK_NOTE_OFFSETS = [
  { note: 'C#', afterWhiteIdx: 0 },
  { note: 'D#', afterWhiteIdx: 1 },
  { note: 'F#', afterWhiteIdx: 3 },
  { note: 'G#', afterWhiteIdx: 4 },
  { note: 'A#', afterWhiteIdx: 5 },
];

const TOTAL_WHITE_KEYS = OCTAVES.length * WHITE_NOTES.length;
const WHITE_KEY_WIDTH = 1.0 / TOTAL_WHITE_KEYS;

const generatePianoKeys = (): PianoKey[] => {
  const keys: PianoKey[] = [];
  let whiteKeyCounter = 0;

  OCTAVES.forEach((octave) => {
    WHITE_NOTES.forEach((note, i) => {
      // Add white key
      keys.push({
        note: `${note}${octave}`,
        isBlack: false,
        left: whiteKeyCounter * WHITE_KEY_WIDTH,
        right: (whiteKeyCounter + 1) * WHITE_KEY_WIDTH,
      });
      
      // Add black key if it follows this white key
      const blackNote = BLACK_NOTE_OFFSETS.find(b => b.afterWhiteIdx === i);
      if (blackNote) {
        const blackWidth = WHITE_KEY_WIDTH * 0.6;
        const boundary = (whiteKeyCounter + 1) * WHITE_KEY_WIDTH;
        keys.push({
          note: `${blackNote.note}${octave}`,
          isBlack: true,
          left: boundary - (blackWidth / 2),
          right: boundary + (blackWidth / 2),
        });
      }
      whiteKeyCounter++;
    });
  });
  return keys;
};

const PIANO_KEYS = generatePianoKeys();

// Fingertip landmark indices
const FINGERTIPS = [4, 8, 12, 16, 20];

// Hysteresis Thresholds
const PRESS_THRESHOLD = 0.55; // Must cross this downward to play
const RELEASE_THRESHOLD = 0.45; // Must cross this upward to reset
const BLACK_KEY_BOTTOM = 0.75; // Y < 0.75 means black key can be pressed

function setsAreEqual(a: Set<string>, b: Set<string>) {
  if (a.size !== b.size) return false;
  for (const item of a) {
    if (!b.has(item)) return false;
  }
  return true;
}

export default function AirPiano() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>(0);
  
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [fps, setFps] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set());
  
  const activeKeysRef = useRef<Set<string>>(new Set());
  const fpsRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const fingerStates = useRef<Map<string, boolean>>(new Map()); // true = currently pressed
  
  const { isLoaded, detectHands } = useHandTracking();

  // Orientation and Camera States
  const [isPortrait, setIsPortrait] = useState(window.innerHeight > window.innerWidth);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');

  // Handle Orientation
  useEffect(() => {
    const handleResize = () => setIsPortrait(window.innerHeight > window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Camera Setup
  useEffect(() => {
    let stream: MediaStream | null = null;
    let isMounted = true;

    async function setupCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: facingMode, width: { ideal: 1280 }, height: { ideal: 720 } }
        });
        
        if (videoRef.current && isMounted) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play();
            setHasPermission(true);
          };
        }
      } catch (err) {
        console.error("Camera access denied or failed:", err);
        if (isMounted) setHasPermission(false);
      }
    }

    setupCamera();

    return () => {
      isMounted = false;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [facingMode]);

  const toggleCamera = () => {
    setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
  };

  const handleStartPlaying = async () => {
    await audio.start();
    setIsPlaying(true);
  };

  const processVideo = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !isLoaded) {
      requestRef.current = requestAnimationFrame(processVideo);
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (video.readyState >= 2 && ctx) {
      if (canvas.width !== video.videoWidth) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      }

      const now = performance.now();
      const results = detectHands(video, now);
      
      fpsRef.current++;
      if (now - lastTimeRef.current >= 1000) {
        setFps(fpsRef.current);
        fpsRef.current = 0;
        lastTimeRef.current = now;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw Hysteresis Lines for debugging/visual guide
      ctx.strokeStyle = 'rgba(0, 210, 255, 0.3)';
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(0, canvas.height * PRESS_THRESHOLD);
      ctx.lineTo(canvas.width, canvas.height * PRESS_THRESHOLD);
      ctx.stroke();
      ctx.setLineDash([]);

      const currentActiveKeys = new Set<string>();

      if (results && results.landmarks) {
        drawHandLandmarks(ctx, results, canvas.width, canvas.height);

        results.landmarks.forEach((hand, handIndex) => {
          FINGERTIPS.forEach((tipIndex) => {
            const landmark = hand[tipIndex];
            // Fix: Front camera is CSS-mirrored, so we invert X. Back camera is not mirrored, so we use raw X.
            const x = facingMode === 'user' ? 1.0 - landmark.x : landmark.x;
            const y = landmark.y;
            
            const fingerId = `${handIndex}-${tipIndex}`;
            const isPressed = fingerStates.current.get(fingerId) || false;
            
            // Hysteresis logic
            if (!isPressed && y >= PRESS_THRESHOLD) {
              // Trigger a new note
              let hitKey: PianoKey | undefined;
              
              if (y < BLACK_KEY_BOTTOM) {
                // Check black keys first
                hitKey = PIANO_KEYS.find(k => k.isBlack && x >= k.left && x <= k.right);
              }
              
              if (!hitKey) {
                // Fallback to white key
                hitKey = PIANO_KEYS.find(k => !k.isBlack && x >= k.left && x <= k.right);
              }
              
              if (hitKey) {
                currentActiveKeys.add(hitKey.note);
                if (isPlaying) audio.playNote(hitKey.note);
                fingerStates.current.set(fingerId, true);
              }
            } else if (isPressed && y < RELEASE_THRESHOLD) {
              // Release the note lock
              fingerStates.current.set(fingerId, false);
            } else if (isPressed) {
              // Maintain visual glow if still held down (not released yet)
              let activeNote: PianoKey | undefined;
              if (y < BLACK_KEY_BOTTOM) activeNote = PIANO_KEYS.find(k => k.isBlack && x >= k.left && x <= k.right);
              if (!activeNote) activeNote = PIANO_KEYS.find(k => !k.isBlack && x >= k.left && x <= k.right);
              if (activeNote) currentActiveKeys.add(activeNote.note);
            }
          });
        });
      }
      
      // Performance Fix: Only update React state if the active keys actually changed
      if (!setsAreEqual(activeKeysRef.current, currentActiveKeys)) {
        activeKeysRef.current = currentActiveKeys;
        setActiveKeys(new Set(currentActiveKeys));
      }
    }

    requestRef.current = requestAnimationFrame(processVideo);
  }, [isLoaded, detectHands, isPlaying]);

  useEffect(() => {
    if (isLoaded && hasPermission && !isPortrait) {
      requestRef.current = requestAnimationFrame(processVideo);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isLoaded, hasPermission, processVideo, isPortrait]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement && containerRef.current) {
      containerRef.current.requestFullscreen().catch(err => console.error(err));
    } else {
      document.exitFullscreen();
    }
  };

  if (hasPermission === false) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <Camera className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Camera Access Denied</h2>
        <p className="text-gray-400 max-w-md">Please grant camera permissions to play the Air Piano.</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="flex-1 bg-black relative overflow-hidden flex flex-col">
      {isPortrait && (
        <div className="absolute inset-0 z-[100] bg-black flex flex-col items-center justify-center p-8 text-center">
          <div className="w-20 h-20 bg-electric-blue/20 rounded-full flex items-center justify-center mb-6">
            <Camera className="w-10 h-10 text-electric-blue animate-pulse" />
          </div>
          <h2 className="text-3xl font-bold mb-4 text-white">Please Rotate Your Device</h2>
          <p className="text-gray-400 max-w-sm">Air Piano works best in Landscape Mode so all 36 keys can fit on your screen.</p>
        </div>
      )}

      <video
        ref={videoRef}
        className={`absolute inset-0 w-full h-full object-fill opacity-60 ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
        playsInline
        muted
      />
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 w-full h-full object-fill z-10 pointer-events-none ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
      />

      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start z-20 pointer-events-none">
        <div className="flex flex-col gap-2 pointer-events-auto">
          <div className="glass-panel px-4 py-2 rounded-full inline-flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isLoaded ? 'bg-green-500' : 'bg-yellow-500'}`} />
            <span className="text-sm font-medium">{isLoaded ? 'AI Ready' : 'Loading...'}</span>
          </div>
          {isLoaded && <span className="text-xs text-gray-300 ml-2">FPS: {fps}</span>}
        </div>
        <div className="flex gap-2 pointer-events-auto">
          <button onClick={toggleCamera} className="w-10 h-10 rounded-full glass-panel flex items-center justify-center hover:bg-white/10" title="Flip Camera">
            <Camera className="w-5 h-5 text-white" />
          </button>
          <button onClick={toggleFullscreen} className="w-10 h-10 rounded-full glass-panel flex items-center justify-center hover:bg-white/10" title="Fullscreen">
            <Maximize2 className="w-5 h-5 text-white" />
          </button>
          <button className="w-10 h-10 rounded-full glass-panel flex items-center justify-center hover:bg-white/10" title="Settings">
            <Settings2 className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {!isPlaying && isLoaded && (
        <div className="absolute top-[25%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30 text-center">
          <motion.button 
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={handleStartPlaying}
            className="flex items-center gap-3 bg-electric-blue text-black font-bold py-4 px-8 rounded-full shadow-[0_0_30px_rgba(0,210,255,0.6)]"
          >
            <Play className="w-6 h-6 fill-current" /> Enable Audio Engine
          </motion.button>
        </div>
      )}

      {/* Piano Overlay */}
      <div className="absolute top-[50%] bottom-0 left-0 right-0 pointer-events-none">
        {/* White Keys */}
        <div className="absolute inset-0 flex bg-white/10 border-t-2 border-electric-blue/50">
          {PIANO_KEYS.filter(k => !k.isBlack).map(key => (
             <div 
               key={key.note}
               className={`absolute bottom-0 top-0 border-r border-black/50 transition-colors duration-75 ${activeKeys.has(key.note) ? 'bg-electric-blue/50 shadow-[0_0_30px_rgba(0,210,255,0.6)_inset]' : ''}`}
               style={{ left: `${key.left * 100}%`, width: `${(key.right - key.left) * 100}%` }}
             >
               <span className={`absolute bottom-2 left-1/2 transform -translate-x-1/2 text-[10px] font-bold ${activeKeys.has(key.note) ? 'text-white' : 'text-white/30'}`}>{key.note}</span>
             </div>
          ))}
        </div>
        
        {/* Black Keys */}
        <div className="absolute top-0 h-[50%] left-0 right-0 z-20 pointer-events-none drop-shadow-xl">
          {PIANO_KEYS.filter(k => k.isBlack).map(key => (
             <div 
               key={key.note}
               className={`absolute top-0 bottom-0 rounded-b-md border-x border-b border-gray-900 transition-colors duration-75 ${activeKeys.has(key.note) ? 'bg-electric-blue shadow-[0_0_20px_#00d2ff]' : 'bg-black'}`}
               style={{ left: `${key.left * 100}%`, width: `${(key.right - key.left) * 100}%` }}
             />
          ))}
        </div>
      </div>
    </div>
  );
}
