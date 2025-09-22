import React from "react";
import { motion } from "framer-motion";
import { RotateCcw, Home, Trophy, Target, Zap } from "lucide-react";
import Button from "../ui/Button";

interface GameOverScreenProps {
  score: number;
  highScore: number;
  isNewHighScore: boolean;
  onRestart: () => void;
  onHome: () => void;
}

const GameOverScreen: React.FC<GameOverScreenProps> = ({
  score,
  highScore,
  isNewHighScore,
  onRestart,
  onHome,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 50 }}
        transition={{ duration: 0.6, type: "spring", damping: 20 }}
        className="glass-strong rounded-3xl p-8 max-w-lg w-full text-center"
      >
        {/* 게임 오버 아이콘 */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            duration: 0.8,
            delay: 0.2,
            type: "spring",
            damping: 10,
          }}
          className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-r from-red-500 to-pink-600 flex items-center justify-center"
        >
          <Target size={40} className="text-white" />
        </motion.div>

        {/* 제목 */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-4xl font-bold gradient-text mb-4"
        >
          Game Over
        </motion.h2>

        {/* 점수 표시 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mb-8"
        >
          <div className="glass rounded-2xl p-6 mb-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Zap className="text-yellow-400" size={20} />
              <span className="text-white/70">Final Score</span>
            </div>
            <motion.div
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              transition={{
                duration: 0.5,
                delay: 0.7,
                type: "spring",
                damping: 10,
              }}
              className="text-4xl font-bold gradient-text"
            >
              {score.toLocaleString()}
            </motion.div>
          </div>

          {/* 새 최고점수 */}
          {isNewHighScore && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="glass rounded-2xl p-4 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/30"
            >
              <div className="flex items-center justify-center gap-2 text-yellow-400">
                <Trophy size={20} />
                <span className="font-semibold">New High Score!</span>
              </div>
            </motion.div>
          )}

          {/* 최고점수 */}
          {!isNewHighScore && (
            <div className="glass rounded-2xl p-4">
              <div className="flex items-center justify-center gap-2 text-white/70">
                <Trophy size={16} />
                <span className="text-sm">
                  High Score: {highScore.toLocaleString()}
                </span>
              </div>
            </div>
          )}
        </motion.div>

        {/* 버튼들 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.9 }}
          className="flex flex-col gap-4"
        >
          <Button
            onClick={onRestart}
            variant="primary"
            size="lg"
            icon={RotateCcw}
            className="w-full"
          >
            Play Again
          </Button>

          <Button
            onClick={onHome}
            variant="ghost"
            size="md"
            icon={Home}
            className="w-full"
          >
            Back to Menu
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default GameOverScreen;
