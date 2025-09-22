import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GameState, GameStats } from "../types/game";
import GameCanvas from "../components/game/GameCanvas";
import GameUI from "../components/game/GameUI";
import StartScreen from "../components/game/StartScreen";
import PauseScreen from "../components/game/PauseScreen";
import GameOverScreen from "../components/game/GameOverScreen";

interface TetrisGameProps {
  onBackToMenu: () => void;
}

interface TetrisPiece {
  shape: number[][];
  color: string;
  x: number;
  y: number;
}

// Position 인터페이스는 현재 사용되지 않으므로 제거

/**
 * 테트리스 게임 컴포넌트
 * 블록을 맞춰서 줄을 완성하는 퍼즐 게임
 */
const TetrisGame: React.FC<TetrisGameProps> = ({ onBackToMenu }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);

  const [gameState, setGameState] = useState<GameState>("playing");
  const [stats, setStats] = useState<GameStats>({
    score: 0,
    highScore: parseInt(localStorage.getItem("tetrisHighScore") || "0"),
    gameSpeed: 1,
    level: 1,
  });

  // 게임 보드 (20x10)
  const BOARD_WIDTH = 10;
  const BOARD_HEIGHT = 20;
  const [cellSize, setCellSize] = useState(30);

  const [board, setBoard] = useState<number[][]>(
    Array(BOARD_HEIGHT)
      .fill(null)
      .map(() => Array(BOARD_WIDTH).fill(0))
  );
  const [currentPiece, setCurrentPiece] = useState<TetrisPiece | null>(null);
  const [nextPiece, setNextPiece] = useState<TetrisPiece | null>(null);
  const [isNewHighScore, setIsNewHighScore] = useState(false);

  // 테트리스 피스 정의
  const TETRIS_PIECES = useMemo(
    () => [
      {
        shape: [[1, 1, 1, 1]], // I
        color: "#06b6d4",
      },
      {
        shape: [
          [1, 1],
          [1, 1],
        ], // O
        color: "#eab308",
      },
      {
        shape: [
          [0, 1, 0],
          [1, 1, 1],
        ], // T
        color: "#8b5cf6",
      },
      {
        shape: [
          [0, 1, 1],
          [1, 1, 0],
        ], // S
        color: "#22c55e",
      },
      {
        shape: [
          [1, 1, 0],
          [0, 1, 1],
        ], // Z
        color: "#ef4444",
      },
      {
        shape: [
          [1, 0, 0],
          [1, 1, 1],
        ], // L
        color: "#f97316",
      },
      {
        shape: [
          [0, 0, 1],
          [1, 1, 1],
        ], // J
        color: "#3b82f6",
      },
    ],
    []
  );

  // 랜덤 피스 생성
  const createRandomPiece = useCallback((): TetrisPiece => {
    const piece =
      TETRIS_PIECES[Math.floor(Math.random() * TETRIS_PIECES.length)];
    return {
      ...piece,
      x: Math.floor(BOARD_WIDTH / 2) - Math.floor(piece.shape[0].length / 2),
      y: 0,
    };
  }, [TETRIS_PIECES]);

  // 피스 회전
  const rotatePiece = useCallback((piece: TetrisPiece): TetrisPiece => {
    const rotated = piece.shape[0].map((_, index) =>
      piece.shape.map((row) => row[index]).reverse()
    );
    return { ...piece, shape: rotated };
  }, []);

  // 피스가 유효한 위치에 있는지 확인
  const isValidPosition = useCallback(
    (piece: TetrisPiece, board: number[][], dx = 0, dy = 0): boolean => {
      const newX = piece.x + dx;
      const newY = piece.y + dy;

      for (let y = 0; y < piece.shape.length; y++) {
        for (let x = 0; x < piece.shape[y].length; x++) {
          if (piece.shape[y][x]) {
            const boardX = newX + x;
            const boardY = newY + y;

            if (
              boardX < 0 ||
              boardX >= BOARD_WIDTH ||
              boardY >= BOARD_HEIGHT ||
              (boardY >= 0 && board[boardY][boardX])
            ) {
              return false;
            }
          }
        }
      }
      return true;
    },
    []
  );

  // 피스를 보드에 고정
  const placePiece = useCallback((piece: TetrisPiece, board: number[][]) => {
    const newBoard = board.map((row) => [...row]);

    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x]) {
          const boardX = piece.x + x;
          const boardY = piece.y + y;
          if (boardY >= 0) {
            newBoard[boardY][boardX] = 1; // 색상은 나중에 처리
          }
        }
      }
    }
    return newBoard;
  }, []);

  // 완성된 줄 찾기 및 제거
  const clearLines = useCallback((board: number[][]) => {
    const newBoard = board.filter((row) => row.some((cell) => cell === 0));
    const linesCleared = BOARD_HEIGHT - newBoard.length;

    // 빈 줄을 위에 추가
    while (newBoard.length < BOARD_HEIGHT) {
      newBoard.unshift(Array(BOARD_WIDTH).fill(0));
    }

    return { board: newBoard, linesCleared };
  }, []);

  // 캔버스 크기 조정
  const resizeCanvas = useCallback(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;

    // 고정된 셀 크기 사용 (30px)
    const newCellSize = 30;
    setCellSize(newCellSize);

    const canvasWidth = BOARD_WIDTH * newCellSize;
    const canvasHeight = BOARD_HEIGHT * newCellSize;

    // 캔버스 크기 설정
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // 캔버스 스타일 설정
    canvas.style.width = `${canvasWidth}px`;
    canvas.style.height = `${canvasHeight}px`;
    canvas.style.border = "1px solid #334155";
    canvas.style.backgroundColor = "#1e293b";
  }, []);

  // 점수 업데이트
  const updateScore = useCallback((linesCleared: number) => {
    if (linesCleared > 0) {
      setStats((prev) => {
        const lineScores = [0, 40, 100, 300, 1200]; // 1, 2, 3, 4줄 제거 점수
        const newScore = prev.score + lineScores[linesCleared] * prev.level;
        const newLevel = Math.floor(newScore / 1000) + 1;
        const newGameSpeed = Math.max(0.1, 1 - (newLevel - 1) * 0.1);

        return {
          ...prev,
          score: newScore,
          level: newLevel,
          gameSpeed: newGameSpeed,
        };
      });
    }
  }, []);

  // 새 피스 생성 및 게임 오버 체크
  const spawnNewPiece = useCallback(
    (clearedBoard: number[][]) => {
      const newCurrentPiece = nextPiece || createRandomPiece();
      const newNextPiece = createRandomPiece();

      // 게임 오버 체크
      if (!isValidPosition(newCurrentPiece, clearedBoard)) {
        setGameState("gameOver");
        return;
      }

      setCurrentPiece(newCurrentPiece);
      setNextPiece(newNextPiece);
    },
    [nextPiece, createRandomPiece, isValidPosition]
  );

  // 게임 업데이트
  const updateGame = useCallback(() => {
    if (gameState !== "playing" || !currentPiece) return;

    // 현재 피스를 아래로 이동
    const newPiece = { ...currentPiece, y: currentPiece.y + 1 };

    if (isValidPosition(newPiece, board)) {
      setCurrentPiece(newPiece);
    } else {
      // 피스를 보드에 고정
      const newBoard = placePiece(currentPiece, board);
      const { board: clearedBoard, linesCleared } = clearLines(newBoard);

      setBoard(clearedBoard);
      updateScore(linesCleared);
      spawnNewPiece(clearedBoard);
    }
  }, [
    gameState,
    currentPiece,
    board,
    isValidPosition,
    placePiece,
    clearLines,
    updateScore,
    spawnNewPiece,
  ]);

  // 그리드 그리기
  const drawGrid = useCallback(
    (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
      ctx.strokeStyle = "#334155";
      ctx.lineWidth = 1;
      for (let x = 0; x <= BOARD_WIDTH; x++) {
        ctx.beginPath();
        ctx.moveTo(x * cellSize, 0);
        ctx.lineTo(x * cellSize, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y <= BOARD_HEIGHT; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * cellSize);
        ctx.lineTo(canvas.width, y * cellSize);
        ctx.stroke();
      }
    },
    [cellSize]
  );

  // 보드 그리기
  const drawBoard = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      for (let y = 0; y < BOARD_HEIGHT; y++) {
        for (let x = 0; x < BOARD_WIDTH; x++) {
          if (board[y][x]) {
            ctx.fillStyle = "#3b82f6";
            ctx.fillRect(
              x * cellSize + 1,
              y * cellSize + 1,
              cellSize - 2,
              cellSize - 2
            );

            // 하이라이트
            ctx.fillStyle = "#60a5fa";
            ctx.fillRect(x * cellSize + 1, y * cellSize + 1, cellSize - 2, 2);
            ctx.fillRect(x * cellSize + 1, y * cellSize + 1, 2, cellSize - 2);
          }
        }
      }
    },
    [board, cellSize]
  );

  // 현재 피스 그리기
  const drawCurrentPiece = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      if (!currentPiece) return;

      ctx.fillStyle = currentPiece.color;
      for (let y = 0; y < currentPiece.shape.length; y++) {
        for (let x = 0; x < currentPiece.shape[y].length; x++) {
          if (currentPiece.shape[y][x]) {
            const boardX = currentPiece.x + x;
            const boardY = currentPiece.y + y;
            if (boardY >= 0) {
              ctx.fillRect(
                boardX * cellSize + 1,
                boardY * cellSize + 1,
                cellSize - 2,
                cellSize - 2
              );

              // 하이라이트
              ctx.fillStyle = "#ffffff";
              ctx.fillRect(
                boardX * cellSize + 1,
                boardY * cellSize + 1,
                cellSize - 2,
                2
              );
              ctx.fillRect(
                boardX * cellSize + 1,
                boardY * cellSize + 1,
                2,
                cellSize - 2
              );
              ctx.fillStyle = currentPiece.color;
            }
          }
        }
      }
    },
    [currentPiece, cellSize]
  );

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
    drawGrid(ctx, canvas);

    if (gameState === "playing" || gameState === "paused") {
      drawBoard(ctx);
      drawCurrentPiece(ctx);
    }
  }, [gameState, drawGrid, drawBoard, drawCurrentPiece]);

  // 게임 루프
  const gameLoop = useCallback(
    (currentTime: number) => {
      if (currentTime - lastTimeRef.current >= 500 / stats.gameSpeed) {
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
    setBoard(
      Array(BOARD_HEIGHT)
        .fill(null)
        .map(() => Array(BOARD_WIDTH).fill(0))
    );

    const newCurrentPiece = createRandomPiece();
    const newNextPiece = createRandomPiece();
    setCurrentPiece(newCurrentPiece);
    setNextPiece(newNextPiece);
  }, [createRandomPiece]);

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

  // 피스 이동
  const movePiece = useCallback(
    (dx: number, dy: number) => {
      if (!currentPiece || gameState !== "playing") return;

      const newPiece = {
        ...currentPiece,
        x: currentPiece.x + dx,
        y: currentPiece.y + dy,
      };
      if (isValidPosition(newPiece, board)) {
        setCurrentPiece(newPiece);
      }
    },
    [currentPiece, gameState, board, isValidPosition]
  );

  // 피스 회전
  const rotateCurrentPiece = useCallback(() => {
    if (!currentPiece || gameState !== "playing") return;

    const rotatedPiece = rotatePiece(currentPiece);
    if (isValidPosition(rotatedPiece, board)) {
      setCurrentPiece(rotatedPiece);
    }
  }, [currentPiece, gameState, board, isValidPosition, rotatePiece]);

  // 빠른 낙하
  const dropPiece = useCallback(() => {
    if (!currentPiece || gameState !== "playing") return;

    let newPiece = { ...currentPiece };
    while (isValidPosition({ ...newPiece, y: newPiece.y + 1 }, board)) {
      newPiece.y++;
    }
    setCurrentPiece(newPiece);
  }, [currentPiece, gameState, board, isValidPosition]);

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
          movePiece(-1, 0);
          break;
        case "ArrowRight":
          movePiece(1, 0);
          break;
        case "ArrowDown":
          movePiece(0, 1);
          break;
        case "ArrowUp":
          rotateCurrentPiece();
          break;
        case " ":
          dropPiece();
          break;
      }
    },
    [gameState, movePiece, rotateCurrentPiece, dropPiece, togglePause]
  );

  // 새 최고점수 체크
  useEffect(() => {
    if (gameState === "gameOver" && stats.score > 0) {
      setIsNewHighScore(stats.score > stats.highScore);
      if (stats.score > stats.highScore) {
        setStats((prev) => ({ ...prev, highScore: stats.score }));
        localStorage.setItem("tetrisHighScore", stats.score.toString());
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

    // 초기 피스 생성
    if (!currentPiece) {
      const newCurrentPiece = createRandomPiece();
      const newNextPiece = createRandomPiece();
      setCurrentPiece(newCurrentPiece);
      setNextPiece(newNextPiece);
    }

    animationRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameLoop, resizeCanvas, currentPiece, createRandomPiece]);

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      {/* 배경 효과 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-float" />
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "2s" }}
        />
      </div>

      {/* 메인 게임 컨테이너 */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, type: "spring", damping: 20 }}
        className="relative w-full max-w-4xl mx-auto flex flex-col items-center"
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
              gameType="tetris"
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
        className="mt-4"
      >
        <div className="glass rounded-2xl px-6 py-3 text-center">
          <p className="text-white/70 text-sm">
            Use <kbd className="px-2 py-1 bg-white/10 rounded text-xs">ESC</kbd>{" "}
            to pause • Use{" "}
            <kbd className="px-2 py-1 bg-white/10 rounded text-xs">
              ARROW KEYS
            </kbd>{" "}
            to move/rotate • Use{" "}
            <kbd className="px-2 py-1 bg-white/10 rounded text-xs">SPACE</kbd>{" "}
            to drop
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default TetrisGame;
