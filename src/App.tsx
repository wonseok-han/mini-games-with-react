import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameEngine } from "./hooks/useGameEngine";
import GameCanvas from "./components/game/GameCanvas";
import GameUI from "./components/game/GameUI";
import StartScreen from "./components/game/StartScreen";
import PauseScreen from "./components/game/PauseScreen";
import GameOverScreen from "./components/game/GameOverScreen";

function App() {
  const { canvasRef, gameState, stats, startGame, restartGame, togglePause } =
    useGameEngine();

  const [isNewHighScore, setIsNewHighScore] = useState(false);

  // 새 최고점수 체크
  useEffect(() => {
    if (gameState === "gameOver" && stats.score > 0) {
      setIsNewHighScore(stats.score > stats.highScore);
    }
  }, [gameState, stats.score, stats.highScore]);

  const handleStart = () => {
    startGame();
  };

  const handleRestart = () => {
    restartGame();
    setIsNewHighScore(false);
  };

  const handlePause = () => {
    togglePause();
  };

  const handleResume = () => {
    togglePause();
  };

  const handleHome = () => {
    // 게임 상태를 start로 리셋
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      {/* 배경 효과 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-float" />
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "2s" }}
        />
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "4s" }}
        />
      </div>

      {/* 메인 게임 컨테이너 */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, type: "spring", damping: 20 }}
        className="relative w-full max-w-6xl aspect-video"
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
            <StartScreen onStart={handleStart} highScore={stats.highScore} />
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
            to pause • Use{" "}
            <kbd className="px-2 py-1 bg-white/10 rounded text-xs">
              ARROW KEYS
            </kbd>{" "}
            or{" "}
            <kbd className="px-2 py-1 bg-white/10 rounded text-xs">MOUSE</kbd>{" "}
            to move
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default App;
