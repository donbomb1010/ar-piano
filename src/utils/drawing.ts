import type { HandLandmarkerResult } from '@mediapipe/tasks-vision';

const FINGER_COLORS = [
  '#FF0000', // Thumb
  '#00FF00', // Index
  '#0000FF', // Middle
  '#FFFF00', // Ring
  '#00FFFF', // Pinky
];

const CONNECTIONS = [
  // Thumb
  [0, 1], [1, 2], [2, 3], [3, 4],
  // Index Finger
  [0, 5], [5, 6], [6, 7], [7, 8],
  // Middle Finger
  [5, 9], [9, 10], [10, 11], [11, 12],
  // Ring Finger
  [9, 13], [13, 14], [14, 15], [15, 16],
  // Pinky
  [13, 17], [0, 17], [17, 18], [18, 19], [19, 20]
];

export function drawHandLandmarks(
  ctx: CanvasRenderingContext2D,
  result: HandLandmarkerResult,
  canvasWidth: number,
  canvasHeight: number
) {
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  if (!result.landmarks) return;

  for (const hand of result.landmarks) {
    // Draw connections
    ctx.strokeStyle = 'rgba(0, 210, 255, 0.5)';
    ctx.lineWidth = 2;
    for (const [startIdx, endIdx] of CONNECTIONS) {
      const start = hand[startIdx];
      const end = hand[endIdx];
      ctx.beginPath();
      ctx.moveTo(start.x * canvasWidth, start.y * canvasHeight);
      ctx.lineTo(end.x * canvasWidth, end.y * canvasHeight);
      ctx.stroke();
    }

    // Draw landmarks
    hand.forEach((landmark, index) => {
      // Determine color based on finger group (roughly)
      let color = '#FFFFFF';
      if (index > 0 && index <= 4) color = FINGER_COLORS[0];
      else if (index > 4 && index <= 8) color = FINGER_COLORS[1];
      else if (index > 8 && index <= 12) color = FINGER_COLORS[2];
      else if (index > 12 && index <= 16) color = FINGER_COLORS[3];
      else if (index > 16 && index <= 20) color = FINGER_COLORS[4];

      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(
        landmark.x * canvasWidth,
        landmark.y * canvasHeight,
        index === 4 || index === 8 || index === 12 || index === 16 || index === 20 ? 5 : 3, // Larger tips
        0,
        2 * Math.PI
      );
      ctx.fill();
    });
  }
}
