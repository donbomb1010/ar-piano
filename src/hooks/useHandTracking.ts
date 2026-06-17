import { useEffect, useRef, useState, useCallback } from 'react';
import { HandLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

export function useHandTracking() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const landmarkerRef = useRef<HandLandmarker | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    async function initializeHandTracking() {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
        );
        
        const handLandmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numHands: 2,
          minHandDetectionConfidence: 0.5,
          minHandPresenceConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        if (isMounted) {
          landmarkerRef.current = handLandmarker;
          setIsLoaded(true);
        }
      } catch (err) {
        console.error("Failed to initialize hand tracking:", err);
        if (isMounted) setError("Failed to load AI model. Please try again.");
      }
    }

    initializeHandTracking();

    return () => {
      isMounted = false;
      if (landmarkerRef.current) {
        landmarkerRef.current.close();
      }
    };
  }, []);

  const detectHands = useCallback((video: HTMLVideoElement, timestamp: number) => {
    if (!landmarkerRef.current) return null;
    return landmarkerRef.current.detectForVideo(video, timestamp);
  }, []);

  return { isLoaded, error, detectHands };
}
