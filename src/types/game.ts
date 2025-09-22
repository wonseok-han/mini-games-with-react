export type GameState = "start" | "playing" | "paused" | "gameOver";

export interface Player {
  x: number;
  y: number;
  size: number;
  color: string;
  speed: number;
  isDragging: boolean;
  dragOffset: { x: number; y: number };
  pulseScale: number;
  pulseSpeed: number;
  rotation: number;
  rotationSpeed: number;
  trail: TrailParticle[];
  maxTrailLength: number;
}

export interface Bullet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
}

export interface TrailParticle {
  x: number;
  y: number;
  life: number;
  decay: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  life: number;
  decay: number;
}

export interface GameStats {
  score: number;
  highScore: number;
  gameSpeed: number;
  level: number;
}

export interface Keys {
  ArrowUp: boolean;
  ArrowDown: boolean;
  ArrowLeft: boolean;
  ArrowRight: boolean;
  Space: boolean;
}
