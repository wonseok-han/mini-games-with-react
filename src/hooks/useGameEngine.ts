import { useCallback, useEffect, useRef, useState } from "react";
import {
  GameState,
  Player,
  Bullet,
  Particle,
  Keys,
  GameStats,
} from "../types/game";

const BULLET_COLORS = [
  "#ef4444", // red-500
  "#f97316", // orange-500
  "#eab308", // yellow-500
  "#22c55e", // green-500
  "#06b6d4", // cyan-500
  "#3b82f6", // blue-500
  "#8b5cf6", // violet-500
  "#ec4899", // pink-500
];

export const useGameEngine = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);

  const [gameState, setGameState] = useState<GameState>("start");
  const [stats, setStats] = useState<GameStats>({
    score: 0,
    highScore: parseInt(localStorage.getItem("dodgeBulletsHighScore") || "0"),
    gameSpeed: 1,
    level: 1,
  });

  // 상태를 ref로도 관리하여 최신 값에 접근 가능하게 함
  const gameStateRef = useRef<GameState>("start");
  const statsRef = useRef<GameStats>({
    score: 0,
    highScore: parseInt(localStorage.getItem("dodgeBulletsHighScore") || "0"),
    gameSpeed: 1,
    level: 1,
  });
  const playerRef = useRef<Player>({
    x: 0,
    y: 0,
    size: 20,
    color: "#3b82f6",
    speed: 5,
    isDragging: false,
    dragOffset: { x: 0, y: 0 },
    pulseScale: 1,
    pulseSpeed: 0.05,
    rotation: 0,
    rotationSpeed: 0.02,
    trail: [],
    maxTrailLength: 8,
  });
  const bulletsRef = useRef<Bullet[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const keysRef = useRef<Keys>({
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
    Space: false,
  });

  const [player, setPlayer] = useState<Player>({
    x: 0,
    y: 0,
    size: 20,
    color: "#3b82f6",
    speed: 5,
    isDragging: false,
    dragOffset: { x: 0, y: 0 },
    pulseScale: 1,
    pulseSpeed: 0.05,
    rotation: 0,
    rotationSpeed: 0.02,
    trail: [],
    maxTrailLength: 8,
  });

  const [bullets, setBullets] = useState<Bullet[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [keys, setKeys] = useState<Keys>({
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
    Space: false,
  });

  // 상태 변경 시 ref도 업데이트
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  useEffect(() => {
    statsRef.current = stats;
  }, [stats]);

  useEffect(() => {
    playerRef.current = player;
  }, [player]);

  useEffect(() => {
    bulletsRef.current = bullets;
  }, [bullets]);

  useEffect(() => {
    particlesRef.current = particles;
  }, [particles]);

  useEffect(() => {
    keysRef.current = keys;
  }, [keys]);

  // 게임 설정
  const bulletSpawnRate = 0.02;
  const bulletSpeed = 2;

  // 캔버스 크기 조정
  const resizeCanvas = useCallback(() => {
    if (!canvasRef.current) return;

    const container = canvasRef.current.parentElement;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const canvas = canvasRef.current;

    canvas.width = containerRect.width;
    canvas.height = containerRect.height;

    // 플레이어 위치 재조정
    setPlayer((prev) => ({
      ...prev,
      x: Math.min(prev.x, canvas.width - prev.size),
      y: Math.min(prev.y, canvas.height - prev.size),
    }));
  }, []);

  // 플레이어 업데이트
  const updatePlayer = useCallback(() => {
    if (gameState !== "playing") return;

    setPlayer((prev) => {
      const prevX = prev.x;
      const prevY = prev.y;
      let newX = prev.x;
      let newY = prev.y;

      // 키 입력에 따른 이동
      if (keys.ArrowUp) {
        newY = Math.max(prev.size, prev.y - prev.speed);
      }
      if (keys.ArrowDown) {
        newY = Math.min(
          canvasRef.current!.height - prev.size,
          prev.y + prev.speed
        );
      }
      if (keys.ArrowLeft) {
        newX = Math.max(prev.size, prev.x - prev.speed);
      }
      if (keys.ArrowRight) {
        newX = Math.min(
          canvasRef.current!.width - prev.size,
          prev.x + prev.speed
        );
      }

      // 궤적 추가
      let newTrail = [...prev.trail];
      if (prevX !== newX || prevY !== newY) {
        newTrail.unshift({
          x: newX,
          y: newY,
          life: 1.0,
          decay: 0.15,
        });

        if (newTrail.length > prev.maxTrailLength) {
          newTrail.pop();
        }
      }

      // 궤적 업데이트
      newTrail = newTrail
        .map((trail) => ({
          ...trail,
          life: trail.life - trail.decay,
        }))
        .filter((trail) => trail.life > 0);

      return {
        ...prev,
        x: newX,
        y: newY,
        trail: newTrail,
        pulseScale: 1 + Math.sin(Date.now() * prev.pulseSpeed) * 0.1,
        rotation: prev.rotation + prev.rotationSpeed,
      };
    });
  }, [gameState, keys]);

  // 총알 생성
  const spawnBullet = useCallback(() => {
    if (Math.random() < bulletSpawnRate * stats.gameSpeed) {
      const side = Math.floor(Math.random() * 4);
      let x, y, vx, vy;

      const color =
        BULLET_COLORS[Math.floor(Math.random() * BULLET_COLORS.length)];

      switch (side) {
        case 0: // 위에서
          x = Math.random() * (canvasRef.current?.width || 800);
          y = -20;
          vx = (Math.random() - 0.5) * 2;
          vy = bulletSpeed + Math.random() * 2;
          break;
        case 1: // 오른쪽에서
          x = (canvasRef.current?.width || 800) + 20;
          y = Math.random() * (canvasRef.current?.height || 600);
          vx = -(bulletSpeed + Math.random() * 2);
          vy = (Math.random() - 0.5) * 2;
          break;
        case 2: // 아래에서
          x = Math.random() * (canvasRef.current?.width || 800);
          y = (canvasRef.current?.height || 600) + 20;
          vx = (Math.random() - 0.5) * 2;
          vy = -(bulletSpeed + Math.random() * 2);
          break;
        case 3: // 왼쪽에서
          x = -20;
          y = Math.random() * (canvasRef.current?.height || 600);
          vx = bulletSpeed + Math.random() * 2;
          vy = (Math.random() - 0.5) * 2;
          break;
        default:
          return;
      }

      const newBullet: Bullet = {
        x,
        y,
        vx,
        vy,
        size: 8 + Math.random() * 4,
        color,
        rotation: 0,
        rotationSpeed: (Math.random() - 0.5) * 0.2,
      };

      setBullets((prev) => [...prev, newBullet]);
    }
  }, [stats.gameSpeed, bulletSpawnRate, bulletSpeed]);

  // 총알 업데이트
  const updateBullets = useCallback(() => {
    setBullets((prev) => {
      const newBullets = prev
        .map((bullet) => ({
          ...bullet,
          x: bullet.x + bullet.vx * stats.gameSpeed,
          y: bullet.y + bullet.vy * stats.gameSpeed,
          rotation: bullet.rotation + bullet.rotationSpeed,
        }))
        .filter((bullet) => {
          const canvas = canvasRef.current;
          if (!canvas) return false;

          return !(
            bullet.x < -50 ||
            bullet.x > canvas.width + 50 ||
            bullet.y < -50 ||
            bullet.y > canvas.height + 50
          );
        });

      // 충돌 검사
      newBullets.forEach((bullet, index) => {
        const dx = bullet.x - player.x;
        const dy = bullet.y - player.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < bullet.size + player.size) {
          // 충돌 발생
          createExplosion(player.x, player.y);
          newBullets.splice(index, 1);
          setGameState("gameOver");
        }
      });

      return newBullets;
    });
  }, [stats.gameSpeed, player]);

  // 폭발 효과 생성
  const createExplosion = useCallback((x: number, y: number) => {
    const newParticles: Particle[] = [];
    for (let i = 0; i < 15; i++) {
      newParticles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 10,
        vy: (Math.random() - 0.5) * 10,
        size: Math.random() * 6 + 2,
        color: "#ef4444",
        life: 1.0,
        decay: 0.02,
      });
    }
    setParticles((prev) => [...prev, ...newParticles]);
  }, []);

  // 파티클 업데이트
  const updateParticles = useCallback(() => {
    setParticles((prev) =>
      prev
        .map((particle) => ({
          ...particle,
          x: particle.x + particle.vx,
          y: particle.y + particle.vy,
          vx: particle.vx * 0.98,
          vy: particle.vy * 0.98,
          life: particle.life - particle.decay,
        }))
        .filter((particle) => particle.life > 0)
    );
  }, []);

  // 점수 업데이트 (매 프레임마다 1점씩 증가)
  const updateScore = useCallback(() => {
    setStats((prev) => {
      const newScore = prev.score + 1;
      let newGameSpeed = prev.gameSpeed;
      let newLevel = prev.level;

      // 100점마다 속도 증가
      if (newScore % 100 === 0) {
        newGameSpeed += 0.1;
        newLevel = Math.floor(newGameSpeed * 10);
      }

      const newStats = {
        ...prev,
        score: newScore,
        gameSpeed: newGameSpeed,
        level: newLevel,
      };

      // ref도 업데이트
      statsRef.current = newStats;

      return newStats;
    });
  }, []);

  // 렌더링
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 캔버스 클리어
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 배경 그라디언트
    const gradient = ctx.createLinearGradient(
      0,
      0,
      canvas.width,
      canvas.height
    );
    gradient.addColorStop(0, "#1e293b");
    gradient.addColorStop(1, "#0f172a");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (
      gameStateRef.current === "playing" ||
      gameStateRef.current === "paused"
    ) {
      // 총알 그리기
      bulletsRef.current.forEach((bullet) => {
        ctx.save();
        ctx.translate(bullet.x, bullet.y);
        ctx.rotate(bullet.rotation);

        // 총알 그림자
        ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;

        // 총알 본체
        ctx.fillStyle = bullet.color;
        ctx.beginPath();
        ctx.arc(0, 0, bullet.size, 0, Math.PI * 2);
        ctx.fill();

        // 총알 하이라이트
        ctx.shadowColor = "transparent";
        ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
        ctx.beginPath();
        ctx.arc(
          -bullet.size * 0.3,
          -bullet.size * 0.3,
          bullet.size * 0.4,
          0,
          Math.PI * 2
        );
        ctx.fill();

        ctx.restore();
      });

      // 플레이어 궤적 그리기
      playerRef.current.trail.forEach((trail, index) => {
        ctx.save();
        ctx.globalAlpha = trail.life * 0.6;
        ctx.fillStyle = playerRef.current.color;
        ctx.beginPath();
        ctx.arc(
          trail.x,
          trail.y,
          playerRef.current.size * (1 - index * 0.1),
          0,
          Math.PI * 2
        );
        ctx.fill();
        ctx.restore();
      });

      // 플레이어 그리기
      ctx.save();
      ctx.translate(playerRef.current.x, playerRef.current.y);
      ctx.scale(playerRef.current.pulseScale, playerRef.current.pulseScale);
      ctx.rotate(playerRef.current.rotation);

      // 플레이어 외곽 글로우 효과
      ctx.shadowColor = playerRef.current.color;
      ctx.shadowBlur = 20;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;

      // 플레이어 외곽 링
      ctx.strokeStyle = playerRef.current.color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, playerRef.current.size + 5, 0, Math.PI * 2);
      ctx.stroke();

      // 플레이어 그림자
      ctx.shadowColor = "rgba(0, 0, 0, 0.4)";
      ctx.shadowBlur = 12;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 6;

      // 플레이어 본체 (그라디언트)
      const gradient = ctx.createRadialGradient(
        0,
        0,
        0,
        0,
        0,
        playerRef.current.size
      );
      gradient.addColorStop(0, "#ffffff");
      gradient.addColorStop(0.3, playerRef.current.color);
      gradient.addColorStop(1, "#1e293b");
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(0, 0, playerRef.current.size, 0, Math.PI * 2);
      ctx.fill();

      // 플레이어 하이라이트
      ctx.shadowColor = "transparent";
      ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
      ctx.beginPath();
      ctx.arc(
        -playerRef.current.size * 0.3,
        -playerRef.current.size * 0.3,
        playerRef.current.size * 0.4,
        0,
        Math.PI * 2
      );
      ctx.fill();

      // 플레이어 내부 패턴 (별 모양)
      ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const angle = (i * Math.PI * 2) / 5;
        const x1 = Math.cos(angle) * (playerRef.current.size * 0.6);
        const y1 = Math.sin(angle) * (playerRef.current.size * 0.6);
        const x2 =
          Math.cos(angle + Math.PI / 5) * (playerRef.current.size * 0.3);
        const y2 =
          Math.sin(angle + Math.PI / 5) * (playerRef.current.size * 0.3);

        if (i === 0) {
          ctx.moveTo(x1, y1);
        } else {
          ctx.lineTo(x1, y1);
        }
        ctx.lineTo(x2, y2);
      }
      ctx.closePath();
      ctx.stroke();

      // 플레이어 중심 점
      ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
      ctx.beginPath();
      ctx.arc(0, 0, playerRef.current.size * 0.15, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      // 파티클 그리기
      particlesRef.current.forEach((particle) => {
        ctx.save();
        ctx.globalAlpha = particle.life;
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
    }
  }, []); // ref를 사용하므로 의존성 배열을 비움

  // 게임 루프 (useRef로 안정적으로 관리)
  const gameLoopRef = useRef<(currentTime: number) => void>();

  // 게임 루프 함수를 매번 업데이트
  gameLoopRef.current = (currentTime: number) => {
    lastTimeRef.current = currentTime;

    if (gameStateRef.current === "playing") {
      updatePlayer();
      spawnBullet();
      updateBullets();
      updateParticles();
      updateScore();
    } else if (gameStateRef.current === "paused") {
      updateParticles();
    }

    render();
    animationRef.current = requestAnimationFrame(gameLoopRef.current!);
  };

  // 게임 시작
  const startGame = useCallback(() => {
    setGameState("playing");
    setStats((prev) => ({ ...prev, score: 0, gameSpeed: 1, level: 1 }));
    setBullets([]);
    setParticles([]);
    setPlayer((prev) => ({
      ...prev,
      x: (canvasRef.current?.width || 800) / 2,
      y: (canvasRef.current?.height || 600) / 2,
      pulseScale: 1,
      rotation: 0,
      trail: [],
    }));
    setKeys({
      ArrowUp: false,
      ArrowDown: false,
      ArrowLeft: false,
      ArrowRight: false,
      Space: false,
    });
  }, []);

  // 게임 재시작
  const restartGame = useCallback(() => {
    startGame();
  }, [startGame]);

  // 일시정지 토글
  const togglePause = useCallback(() => {
    if (gameState === "playing") {
      setGameState("paused");
    } else if (gameState === "paused") {
      setGameState("playing");
    }
  }, [gameState]);

  // 게임 오버
  const gameOver = useCallback(() => {
    setGameState("gameOver");
    if (stats.score > stats.highScore) {
      const newHighScore = stats.score;
      setStats((prev) => ({ ...prev, highScore: newHighScore }));
      localStorage.setItem("dodgeBulletsHighScore", newHighScore.toString());
    }
  }, [stats.score, stats.highScore]);

  // 키보드 이벤트 처리
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        togglePause();
        return;
      }

      if (gameState !== "playing") return;

      if (keys.hasOwnProperty(e.key as keyof Keys)) {
        e.preventDefault();
        setKeys((prev) => ({ ...prev, [e.key as keyof Keys]: true }));
      }
    },
    [gameState, keys, togglePause]
  );

  const handleKeyUp = useCallback(
    (e: KeyboardEvent) => {
      if (keys.hasOwnProperty(e.key as keyof Keys)) {
        e.preventDefault();
        setKeys((prev) => ({ ...prev, [e.key as keyof Keys]: false }));
      }
    },
    [keys]
  );

  // 마우스/터치 이벤트 처리
  const handleMouseDown = useCallback(
    (e: MouseEvent) => {
      if (gameState !== "playing") return;

      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      setPlayer((prev) => ({
        ...prev,
        isDragging: true,
        dragOffset: { x: mouseX - prev.x, y: mouseY - prev.y },
      }));
    },
    [gameState]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (gameState !== "playing" || !player.isDragging) return;

      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      setPlayer((prev) => ({
        ...prev,
        x: Math.max(
          prev.size,
          Math.min(
            (canvasRef.current?.width || 800) - prev.size,
            mouseX - prev.dragOffset.x
          )
        ),
        y: Math.max(
          prev.size,
          Math.min(
            (canvasRef.current?.height || 600) - prev.size,
            mouseY - prev.dragOffset.y
          )
        ),
      }));
    },
    [gameState, player.isDragging]
  );

  const handleMouseUp = useCallback(() => {
    setPlayer((prev) => ({ ...prev, isDragging: false }));
  }, []);

  // 이벤트 리스너 등록
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);
    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("resize", resizeCanvas);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [
    handleKeyDown,
    handleKeyUp,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    resizeCanvas,
  ]);

  // 게임 루프 시작
  useEffect(() => {
    resizeCanvas();
    animationRef.current = requestAnimationFrame(gameLoopRef.current!);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []); // 의존성 배열을 비워서 한 번만 실행

  return {
    canvasRef,
    gameState,
    stats,
    startGame,
    restartGame,
    togglePause,
    gameOver,
  };
};
