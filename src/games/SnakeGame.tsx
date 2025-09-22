import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GameState, GameStats } from "../types/game";
import GameCanvas from "../components/game/GameCanvas";
import GameUI from "../components/game/GameUI";
import StartScreen from "../components/game/StartScreen";
import PauseScreen from "../components/game/PauseScreen";
import GameOverScreen from "../components/game/GameOverScreen";

interface SnakeGameProps {
  onBackToMenu: () => void;
}

interface Direction {
  x: number;
  y: number;
}

interface SnakeSegment {
  x: number;
  y: number;
}

interface Food {
  x: number;
  y: number;
}

/**
 * Snake 게임 컴포넌트
 * 뱀을 조종하여 먹이를 먹고 성장시키는 게임
 */
const SnakeGame: React.FC<SnakeGameProps> = ({ onBackToMenu }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);

  const [gameState, setGameState] = useState<GameState>("start");
  const [stats, setStats] = useState<GameStats>({
    score: 0,
    highScore: parseInt(localStorage.getItem("snakeHighScore") || "0"),
    gameSpeed: 1,
    level: 1,
  });

  const [snake, setSnake] = useState<SnakeSegment[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<Food>({ x: 15, y: 15 });
  const [direction, setDirection] = useState<Direction>({ x: 1, y: 0 });
  // Snake 게임에서는 키 상태를 사용하지 않으므로 제거

  const [isNewHighScore, setIsNewHighScore] = useState(false);

  // 게임 설정
  const GRID_SIZE = 20;
  const INITIAL_SPEED = 150; // 밀리초

  // 캔버스 크기 조정
  const resizeCanvas = useCallback(() => {
    if (!canvasRef.current) return;

    const container = canvasRef.current.parentElement;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const canvas = canvasRef.current;

    // 그리드에 맞춰 캔버스 크기 조정
    const gridWidth = Math.floor(containerRect.width / GRID_SIZE);
    const gridHeight = Math.floor(containerRect.height / GRID_SIZE);

    canvas.width = gridWidth * GRID_SIZE;
    canvas.height = gridHeight * GRID_SIZE;
  }, []);

  // 새로운 먹이 생성
  const generateFood = useCallback((snakeBody: SnakeSegment[]) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 15, y: 15 };

    const maxX = Math.floor(canvas.width / GRID_SIZE) - 1;
    const maxY = Math.floor(canvas.height / GRID_SIZE) - 1;

    // 무한 루프 방지를 위한 최대 시도 횟수
    const maxAttempts = 1000;

    const isPositionOccupied = (x: number, y: number) => {
      return snakeBody.some((segment) => segment.x === x && segment.y === y);
    };

    for (let attempts = 0; attempts < maxAttempts; attempts++) {
      const newFood: Food = {
        x: Math.floor(Math.random() * maxX),
        y: Math.floor(Math.random() * maxY),
      };

      if (!isPositionOccupied(newFood.x, newFood.y)) {
        return newFood;
      }
    }

    // 최대 시도 횟수에 도달하면 기본 위치 반환
    return { x: 15, y: 15 };
  }, []);

  // 게임 업데이트
  const updateGame = useCallback(() => {
    if (gameState !== "playing") return;

    setSnake((prevSnake) => {
      const newSnake = [...prevSnake];
      const head = { ...newSnake[0] };

      // 머리 이동
      head.x += direction.x;
      head.y += direction.y;

      // 벽 충돌 검사
      const canvas = canvasRef.current;
      if (!canvas) return prevSnake;

      const maxX = Math.floor(canvas.width / GRID_SIZE) - 1;
      const maxY = Math.floor(canvas.height / GRID_SIZE) - 1;

      if (head.x < 0 || head.x > maxX || head.y < 0 || head.y > maxY) {
        setGameState("gameOver");
        return prevSnake;
      }

      // 자기 자신과 충돌 검사
      if (
        newSnake.some((segment) => segment.x === head.x && segment.y === head.y)
      ) {
        setGameState("gameOver");
        return prevSnake;
      }

      newSnake.unshift(head);

      // 먹이 먹었는지 확인
      if (head.x === food.x && head.y === food.y) {
        // 점수 증가
        setStats((prev) => {
          const newScore = prev.score + 10;
          const newLevel = Math.floor(newScore / 100) + 1;
          const newGameSpeed = Math.max(0.5, 1 - (newLevel - 1) * 0.1);

          return {
            ...prev,
            score: newScore,
            level: newLevel,
            gameSpeed: newGameSpeed,
          };
        });

        // 새로운 먹이 생성
        setFood(generateFood(newSnake));
      } else {
        // 꼬리 제거
        newSnake.pop();
      }

      return newSnake;
    });
  }, [gameState, direction, food, generateFood]);

  // 렌더링
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 캔버스 클리어
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 배경 그리기
    ctx.fillStyle = "#1e293b";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 그리드 그리기
    ctx.strokeStyle = "#334155";
    ctx.lineWidth = 1;
    for (let x = 0; x <= canvas.width; x += GRID_SIZE) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y <= canvas.height; y += GRID_SIZE) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    if (gameState === "playing" || gameState === "paused") {
      // 뱀 그리기
      snake.forEach((segment, index) => {
        const x = segment.x * GRID_SIZE;
        const y = segment.y * GRID_SIZE;

        if (index === 0) {
          // 머리
          ctx.fillStyle = "#22c55e";
          ctx.fillRect(x + 2, y + 2, GRID_SIZE - 4, GRID_SIZE - 4);

          // 눈 그리기
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(x + 6, y + 6, 3, 3);
          ctx.fillRect(x + 11, y + 6, 3, 3);
        } else {
          // 몸통
          ctx.fillStyle = "#16a34a";
          ctx.fillRect(x + 1, y + 1, GRID_SIZE - 2, GRID_SIZE - 2);
        }
      });

      // 먹이 그리기
      const foodX = food.x * GRID_SIZE;
      const foodY = food.y * GRID_SIZE;

      ctx.fillStyle = "#ef4444";
      ctx.beginPath();
      ctx.arc(
        foodX + GRID_SIZE / 2,
        foodY + GRID_SIZE / 2,
        GRID_SIZE / 2 - 2,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
  }, [gameState, snake, food]);

  // 게임 루프
  const gameLoop = useCallback(
    (currentTime: number) => {
      if (
        currentTime - lastTimeRef.current >=
        INITIAL_SPEED / stats.gameSpeed
      ) {
        updateGame();
        lastTimeRef.current = currentTime;
      }

      render();
      animationRef.current = requestAnimationFrame(gameLoop);
    },
    [updateGame, render, stats.gameSpeed]
  );

  // 게임 시작
  const startGame = useCallback(() => {
    setGameState("playing");
    setStats((prev) => ({ ...prev, score: 0, gameSpeed: 1, level: 1 }));
    setSnake([{ x: 10, y: 10 }]);
    setDirection({ x: 1, y: 0 });
    setFood(generateFood([{ x: 10, y: 10 }]));
  }, [generateFood]);

  // 게임 재시작
  const restartGame = useCallback(() => {
    startGame();
    setIsNewHighScore(false);
  }, [startGame]);

  // 일시정지 토글
  const togglePause = useCallback(() => {
    if (gameState === "playing") {
      setGameState("paused");
    } else if (gameState === "paused") {
      setGameState("playing");
    }
  }, [gameState]);

  // 키보드 이벤트 처리
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.code === "Space" || e.key === "Escape") {
        e.preventDefault();
        togglePause();
        return;
      }

      if (gameState !== "playing") return;

      e.preventDefault();

      switch (e.key) {
        case "ArrowUp":
          if (direction.y === 0) setDirection({ x: 0, y: -1 });
          break;
        case "ArrowDown":
          if (direction.y === 0) setDirection({ x: 0, y: 1 });
          break;
        case "ArrowLeft":
          if (direction.x === 0) setDirection({ x: -1, y: 0 });
          break;
        case "ArrowRight":
          if (direction.x === 0) setDirection({ x: 1, y: 0 });
          break;
      }
    },
    [gameState, direction, togglePause]
  );

  // 새 최고점수 체크
  useEffect(() => {
    if (gameState === "gameOver" && stats.score > 0) {
      setIsNewHighScore(stats.score > stats.highScore);
      if (stats.score > stats.highScore) {
        setStats((prev) => ({ ...prev, highScore: stats.score }));
        localStorage.setItem("snakeHighScore", stats.score.toString());
      }
    }
  }, [gameState, stats.score, stats.highScore]);

  // 이벤트 리스너 등록
  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", resizeCanvas);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [handleKeyDown, resizeCanvas]);

  // 게임 루프 시작
  useEffect(() => {
    resizeCanvas();
    animationRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameLoop, resizeCanvas]);

  const handleStart = () => {
    startGame();
  };

  const handleRestart = () => {
    restartGame();
  };

  const handlePause = () => {
    togglePause();
  };

  const handleResume = () => {
    togglePause();
  };

  const handleHome = () => {
    onBackToMenu();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-slate-900 flex items-center justify-center p-4">
      {/* 배경 효과 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl animate-float" />
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "2s" }}
        />
      </div>

      {/* 메인 게임 컨테이너 */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, type: "spring", damping: 20 }}
        className="relative w-full max-w-4xl aspect-video"
      >
        {/* 게임 캔버스 */}
        <GameCanvas canvasRef={canvasRef} className="w-full h-full" />

        {/* 게임 UI (게임 중일 때만) */}
        <AnimatePresence>
          {(gameState === "playing" || gameState === "paused") && (
            <GameUI
              stats={stats}
              gameState={gameState}
              onPause={handlePause}
              onResume={handleResume}
            />
          )}
        </AnimatePresence>

        {/* 시작 화면 */}
        <AnimatePresence>
          {gameState === "start" && (
            <StartScreen
              onStart={handleStart}
              highScore={stats.highScore}
              gameType="snake"
            />
          )}
        </AnimatePresence>

        {/* 일시정지 화면 */}
        <AnimatePresence>
          {gameState === "paused" && (
            <PauseScreen
              onResume={handleResume}
              onRestart={handleRestart}
              onHome={handleHome}
            />
          )}
        </AnimatePresence>

        {/* 게임 오버 화면 */}
        <AnimatePresence>
          {gameState === "gameOver" && (
            <GameOverScreen
              score={stats.score}
              highScore={stats.highScore}
              isNewHighScore={isNewHighScore}
              onRestart={handleRestart}
              onHome={handleHome}
            />
          )}
        </AnimatePresence>
      </motion.div>

      {/* 하단 정보 */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.0 }}
        className="absolute bottom-4 left-1/2 transform -translate-x-1/2"
      >
        <div className="glass rounded-2xl px-6 py-3 text-center">
          <p className="text-white/70 text-sm">
            Use{" "}
            <kbd className="px-2 py-1 bg-white/10 rounded text-xs">SPACE</kbd>{" "}
            or <kbd className="px-2 py-1 bg-white/10 rounded text-xs">ESC</kbd>{" "}
            to pause • Use{" "}
            <kbd className="px-2 py-1 bg-white/10 rounded text-xs">
              ARROW KEYS
            </kbd>{" "}
            to move
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default SnakeGame;
