import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GameType } from "./types/game";
import GameMenu from "./components/menu/GameMenu";
import DodgeBulletsGame from "./games/DodgeBulletsGame";
import SnakeGame from "./games/SnakeGame";
import TetrisGame from "./games/TetrisGame";
import BreakoutGame from "./games/BreakoutGame";

/**
 * 메인 App 컴포넌트
 * 게임 메뉴와 선택된 게임 간의 전환을 관리합니다.
 */
function App() {
  const [currentGame, setCurrentGame] = useState<GameType | null>(null);

  /**
   * 게임 선택 핸들러
   * @param gameType 선택된 게임 타입
   */
  const handleSelectGame = (gameType: GameType) => {
    setCurrentGame(gameType);
  };

  /**
   * 메뉴로 돌아가기 핸들러
   */
  const handleBackToMenu = () => {
    setCurrentGame(null);
  };

  /**
   * 현재 게임 컴포넌트 렌더링
   */
  const renderCurrentGame = () => {
    switch (currentGame) {
      case "dodge-bullets":
        return <DodgeBulletsGame onBackToMenu={handleBackToMenu} />;
      case "snake":
        return <SnakeGame onBackToMenu={handleBackToMenu} />;
      case "tetris":
        return <TetrisGame onBackToMenu={handleBackToMenu} />;
      case "pong":
        return (
          <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
            <div className="text-center text-white">
              <h1 className="text-4xl font-bold mb-4">🏓 Pong</h1>
              <p className="text-xl mb-8">곧 출시 예정입니다!</p>
              <button
                onClick={handleBackToMenu}
                className="glass rounded-xl px-8 py-3 text-white hover:bg-white/10 transition-all duration-300"
              >
                메뉴로 돌아가기
              </button>
            </div>
          </div>
        );
      case "breakout":
        return <BreakoutGame onBackToMenu={handleBackToMenu} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen">
      <AnimatePresence mode="wait">
        {currentGame ? (
          <motion.div
            key={currentGame}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5 }}
          >
            {renderCurrentGame()}
          </motion.div>
        ) : (
          <motion.div
            key="menu"
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ duration: 0.5 }}
          >
            <GameMenu onSelectGame={handleSelectGame} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
