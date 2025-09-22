import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSound } from "../hooks/useSound";
import { GameState, GameStats } from "../types/game";
import GameCanvas from "../components/game/GameCanvas";
import GameUI from "../components/game/GameUI";
import StartScreen from "../components/game/StartScreen";
import PauseScreen from "../components/game/PauseScreen";
import GameOverScreen from "../components/game/GameOverScreen";

interface BreakoutGameProps {
  onBackToMenu: () => void;
}

interface Paddle {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
}

interface Ball {
  x: number;
  y: number;
  radius: number;
  velocityX: number;
  velocityY: number;
  speed: number;
}

interface Brick {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  points: number;
  destroyed: boolean;
}

/**
 * Breakout 게임 컴포넌트
 * 패들로 공을 튕겨서 벽돌을 깨는 게임
 */
const BreakoutGame: React.FC<BreakoutGameProps> = ({ onBackToMenu }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  const { playSound } = useSound();

  const [gameState, setGameState] = useState<GameState>("start");
  const [stats, setStats] = useState<GameStats>({
    score: 0,
    highScore: parseInt(localStorage.getItem("breakoutHighScore") || "0"),
    gameSpeed: 1,
    level: 1,
  });

  // 게임 설정
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  const CANVAS_WIDTH = canvasSize.width;
  const CANVAS_HEIGHT = canvasSize.height;
  const PADDLE_WIDTH = 100;
  const PADDLE_HEIGHT = 15;
  const BALL_RADIUS = 8;
  const BRICK_ROWS = 8;
  const BRICK_COLS = 10;
  const BRICK_WIDTH = 70;
  const BRICK_HEIGHT = 20;
  const BRICK_PADDING = 5;
  const INITIAL_BALL_SPEED = 5;

  // 게임 객체들
  const [paddle, setPaddle] = useState<Paddle>({
    x: 350,
    y: 550,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    speed: 6,
  });

  const [ball, setBall] = useState<Ball>({
    x: 400,
    y: 300,
    radius: BALL_RADIUS,
    velocityX: INITIAL_BALL_SPEED,
    velocityY: -INITIAL_BALL_SPEED,
    speed: INITIAL_BALL_SPEED,
  });

  const [bricks, setBricks] = useState<Brick[]>([]);
  const [isNewHighScore, setIsNewHighScore] = useState(false);
  const [keys, setKeys] = useState({ left: false, right: false });
  const [isBallLaunched, setIsBallLaunched] = useState(false);

  // 벽돌 생성
  const createBricks = useCallback(() => {
    const newBricks: Brick[] = [];
    const colors = [
      "#ef4444", // 빨강
      "#f97316", // 주황
      "#eab308", // 노랑
      "#22c55e", // 초록
      "#3b82f6", // 파랑
      "#8b5cf6", // 보라
      "#ec4899", // 분홍
      "#06b6d4", // 청록
    ];

    // 캔버스 크기에 맞춰 벽돌 배치
    const totalBrickWidth =
      BRICK_COLS * BRICK_WIDTH + (BRICK_COLS - 1) * BRICK_PADDING;
    const startX = (CANVAS_WIDTH - totalBrickWidth) / 2;
    const startY = CANVAS_HEIGHT * 0.1; // 상단 10% 위치

    for (let row = 0; row < BRICK_ROWS; row++) {
      for (let col = 0; col < BRICK_COLS; col++) {
        const x = startX + col * (BRICK_WIDTH + BRICK_PADDING);
        const y = startY + row * (BRICK_HEIGHT + BRICK_PADDING);
        const color = colors[row % colors.length];
        const points = (BRICK_ROWS - row) * 10; // 위쪽 벽돌일수록 높은 점수

        newBricks.push({
          x,
          y,
          width: BRICK_WIDTH,
          height: BRICK_HEIGHT,
          color,
          points,
          destroyed: false,
        });
      }
    }

    return newBricks;
  }, [CANVAS_WIDTH]);

  // 게임 초기화
  const initializeGame = useCallback(() => {
    setPaddle({
      x: CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2,
      y: CANVAS_HEIGHT - 50,
      width: PADDLE_WIDTH,
      height: PADDLE_HEIGHT,
      speed: 6,
    });

    setBall({
      x: CANVAS_WIDTH / 2,
      y: CANVAS_HEIGHT * 0.6, // 캔버스 높이의 60% 위치
      radius: BALL_RADIUS,
      velocityX: INITIAL_BALL_SPEED,
      velocityY: -INITIAL_BALL_SPEED,
      speed: INITIAL_BALL_SPEED,
    });

    setBricks(createBricks());
  }, [createBricks, CANVAS_WIDTH, CANVAS_HEIGHT]);

  // 캔버스 크기 조정
  const resizeCanvas = useCallback(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const container = canvas.parentElement;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const newWidth = containerRect.width;
    const newHeight = containerRect.height;

    setCanvasSize({ width: newWidth, height: newHeight });

    canvas.width = newWidth;
    canvas.height = newHeight;
    canvas.style.width = `${newWidth}px`;
    canvas.style.height = `${newHeight}px`;
    canvas.style.border = "1px solid #334155";
    canvas.style.backgroundColor = "#1e293b";
  }, []);

  // 충돌 감지
  const checkCollision = useCallback((ball: Ball, paddle: Paddle) => {
    return (
      ball.x + ball.radius > paddle.x &&
      ball.x - ball.radius < paddle.x + paddle.width &&
      ball.y + ball.radius > paddle.y &&
      ball.y - ball.radius < paddle.y + paddle.height
    );
  }, []);

  const checkBrickCollision = useCallback((ball: Ball, brick: Brick) => {
    return (
      !brick.destroyed &&
      ball.x + ball.radius > brick.x &&
      ball.x - ball.radius < brick.x + brick.width &&
      ball.y + ball.radius > brick.y &&
      ball.y - ball.radius < brick.y + brick.height
    );
  }, []);

  // 게임 업데이트
  const updateGame = useCallback(() => {
    if (gameState !== "playing") return;

    // 패들 상태 업데이트 (키 입력에 따라)
    setPaddle((prevPaddle) => {
      let newX = prevPaddle.x;

      if (keys.left) {
        newX = Math.max(0, newX - prevPaddle.speed);
      }
      if (keys.right) {
        newX = Math.min(
          CANVAS_WIDTH - prevPaddle.width,
          newX + prevPaddle.speed
        );
      }

      return { ...prevPaddle, x: newX };
    });

    // 공과 벽돌을 함께 업데이트
    setBall((prevBall) => {
      let newBall = { ...prevBall };

      // 공이 발사되지 않았으면 패들 위에 따라다님
      if (!isBallLaunched) {
        newBall.x = paddle.x + paddle.width / 2;
        newBall.y = paddle.y - newBall.radius - 5;
        return newBall;
      }

      // 공 위치 업데이트
      newBall.x += newBall.velocityX;
      newBall.y += newBall.velocityY;

      // 벽 충돌
      if (
        newBall.x - newBall.radius <= 0 ||
        newBall.x + newBall.radius >= CANVAS_WIDTH
      ) {
        newBall.velocityX = -newBall.velocityX;
      }
      if (newBall.y - newBall.radius <= 0) {
        newBall.velocityY = -newBall.velocityY;
      }

      // 패들 충돌
      if (checkCollision(newBall, paddle)) {
        playSound("paddleHit");
        const hitPos =
          (newBall.x - (paddle.x + paddle.width / 2)) / (paddle.width / 2);
        newBall.velocityX = hitPos * newBall.speed;
        newBall.velocityY = -Math.abs(newBall.velocityY);
        newBall.y = paddle.y - newBall.radius;
      }

      // 바닥에 떨어짐 (게임 오버)
      if (newBall.y + newBall.radius >= CANVAS_HEIGHT) {
        playSound("gameOver");
        setGameState("gameOver");
        setIsBallLaunched(false);
        setKeys({ left: false, right: false }); // 키 상태 초기화
        return prevBall;
      }

      return newBall;
    });

    // 벽돌 충돌 체크 (새로운 공 위치로)
    setBricks((prevBricks) => {
      const newBricks = [...prevBricks];
      let scoreIncrease = 0;
      let ballHit = false;

      // 새로운 공 위치 계산
      const newBallX = ball.x + ball.velocityX;
      const newBallY = ball.y + ball.velocityY;

      newBricks.forEach((brick) => {
        if (!brick.destroyed && !ballHit) {
          // 임시 공 객체로 충돌 체크
          const tempBall = {
            x: newBallX,
            y: newBallY,
            radius: ball.radius,
            velocityX: ball.velocityX,
            velocityY: ball.velocityY,
            speed: ball.speed,
          };

          if (checkBrickCollision(tempBall, brick)) {
            playSound("brickBreak");
            brick.destroyed = true;
            scoreIncrease += brick.points;
            ballHit = true;

            // 공의 반사 방향 계산
            const ballCenterX = newBallX;
            const ballCenterY = newBallY;
            const brickCenterX = brick.x + brick.width / 2;
            const brickCenterY = brick.y + brick.height / 2;

            const dx = ballCenterX - brickCenterX;
            const dy = ballCenterY - brickCenterY;

            // 공의 속도 업데이트
            setBall((prevBall) => {
              let updatedBall = { ...prevBall };
              if (Math.abs(dx) > Math.abs(dy)) {
                updatedBall.velocityX = -updatedBall.velocityX;
              } else {
                updatedBall.velocityY = -updatedBall.velocityY;
              }
              return updatedBall;
            });
          }
        }
      });

      if (scoreIncrease > 0) {
        setStats((prev) => ({
          ...prev,
          score: prev.score + scoreIncrease,
        }));
      }

      return newBricks;
    });

    // 모든 벽돌이 파괴되었는지 체크
    setBricks((prevBricks) => {
      const remainingBricks = prevBricks.filter((brick) => !brick.destroyed);
      if (remainingBricks.length === 0) {
        // 다음 레벨
        setStats((prev) => ({
          ...prev,
          level: prev.level + 1,
          gameSpeed: Math.min(prev.gameSpeed + 0.2, 3),
        }));
        setBricks(createBricks());
      }
      return remainingBricks;
    });
  }, [
    gameState,
    paddle,
    ball,
    keys,
    isBallLaunched,
    checkCollision,
    checkBrickCollision,
    createBricks,
  ]);

  // 렌더링
  const render = useCallback(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 캔버스 클리어
    ctx.fillStyle = "#1e293b";
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // 패들 그리기
    ctx.fillStyle = "#3b82f6";
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);

    // 공 그리기
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();

    // 벽돌 그리기
    bricks.forEach((brick) => {
      if (!brick.destroyed) {
        ctx.fillStyle = brick.color;
        ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1;
        ctx.strokeRect(brick.x, brick.y, brick.width, brick.height);
      }
    });
  }, [paddle, ball, bricks]);

  // 게임 루프
  const gameLoop = useCallback(
    (currentTime: number) => {
      if (gameState === "playing") {
        if (currentTime - lastTimeRef.current >= 16) {
          updateGame();
          lastTimeRef.current = currentTime;
        }
      }

      render();
      animationRef.current = requestAnimationFrame(gameLoop);
    },
    [updateGame, render, gameState]
  );

  // 게임 시작
  const startGame = useCallback(() => {
    setGameState("playing");
    setStats((prev) => ({ ...prev, score: 0, gameSpeed: 1, level: 1 }));
    setIsBallLaunched(false);
    setKeys({ left: false, right: false }); // 키 상태 초기화
    initializeGame();
  }, [initializeGame]);

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
      if (e.key === "Escape") {
        e.preventDefault();
        togglePause();
        return;
      }

      if (gameState !== "playing") return;

      e.preventDefault();

      switch (e.key) {
        case "ArrowLeft":
          setKeys((prev) => ({ ...prev, left: true }));
          break;
        case "ArrowRight":
          setKeys((prev) => ({ ...prev, right: true }));
          break;
        case " ":
          if (!isBallLaunched) {
            playSound("ballLaunch");
            setIsBallLaunched(true);
          }
          break;
      }
    },
    [gameState, togglePause, isBallLaunched]
  );

  // 키업 이벤트 처리
  const handleKeyUp = useCallback(
    (e: KeyboardEvent) => {
      if (gameState !== "playing") return;

      e.preventDefault();

      switch (e.key) {
        case "ArrowLeft":
          setKeys((prev) => ({ ...prev, left: false }));
          break;
        case "ArrowRight":
          setKeys((prev) => ({ ...prev, right: false }));
          break;
      }
    },
    [gameState]
  );

  // 새 최고점수 체크
  useEffect(() => {
    if (gameState === "gameOver" && stats.score > 0) {
      setIsNewHighScore(stats.score > stats.highScore);
      if (stats.score > stats.highScore) {
        setStats((prev) => ({ ...prev, highScore: stats.score }));
        localStorage.setItem("breakoutHighScore", stats.score.toString());
      }
    }
  }, [gameState, stats.score, stats.highScore]);

  // 이벤트 리스너 등록
  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);
    window.addEventListener("resize", resizeCanvas);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [handleKeyDown, handleKeyUp, resizeCanvas]);

  // 게임 시작 시 초기화
  useEffect(() => {
    if (gameState === "playing") {
      initializeGame();
    }
  }, [gameState, initializeGame]);

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
    playSound("button");
    startGame();
  };

  const handlePause = () => {
    playSound("pause");
    togglePause();
  };

  const handleResume = () => {
    playSound("resume");
    togglePause();
  };

  const handleRestart = () => {
    playSound("button");
    restartGame();
  };

  const handleHome = () => {
    onBackToMenu();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-orange-900 to-slate-900 flex items-center justify-center p-4">
      {/* 배경 효과 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-float" />
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "2s" }}
        />
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "4s" }}
        />
      </div>

      {/* 메인 게임 컨테이너 */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, type: "spring", damping: 20 }}
        className="relative w-full max-w-4xl flex flex-col items-center"
      >
        {/* 게임 UI (게임 중일 때만) - 캔버스 위쪽에 배치 */}
        <AnimatePresence>
          {(gameState === "playing" || gameState === "paused") && (
            <div className="mb-6 w-full">
              <GameUI
                stats={stats}
                gameState={gameState}
                onPause={handlePause}
                onResume={handleResume}
              />
            </div>
          )}
        </AnimatePresence>

        {/* 게임 캔버스 */}
        <div className="w-full aspect-video">
          <GameCanvas canvasRef={canvasRef} className="w-full h-full" />
        </div>

        {/* 시작 화면 */}
        <AnimatePresence>
          {gameState === "start" && (
            <StartScreen
              onStart={handleStart}
              highScore={stats.highScore}
              gameType="breakout"
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
            Use <kbd className="px-2 py-1 bg-white/10 rounded text-xs">ESC</kbd>{" "}
            to pause • Use{" "}
            <kbd className="px-2 py-1 bg-white/10 rounded text-xs">
              ARROW KEYS
            </kbd>{" "}
            to move paddle • Press{" "}
            <kbd className="px-2 py-1 bg-white/10 rounded text-xs">SPACE</kbd>{" "}
            to launch ball
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default BreakoutGame;
