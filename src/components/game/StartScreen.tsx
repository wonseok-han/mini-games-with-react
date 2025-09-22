import React from "react";
import { motion } from "framer-motion";
import {
  Play,
  Target,
  Zap,
  Trophy,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  MousePointer,
} from "lucide-react";
import Button from "../ui/Button";

interface StartScreenProps {
  onStart: () => void;
  highScore: number;
}

const StartScreen: React.FC<StartScreenProps> = ({ onStart, highScore }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, type: "spring", damping: 20 }}
        className="glass-strong rounded-3xl p-8 max-w-2xl w-full text-center"
      >
        {/* 게임 타이틀 */}
        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-6xl font-bold gradient-text mb-4 font-display"
        >
          Dodge Bullets
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-xl text-white/80 mb-8"
        >
          Navigate through the chaos and survive as long as possible!
        </motion.p>

        {/* 게임 정보 카드들 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
        >
          <div className="glass rounded-2xl p-6 text-left">
            <div className="flex items-center gap-3 mb-3">
              <Target className="text-blue-400" size={24} />
              <h3 className="text-lg font-semibold text-white">Objective</h3>
            </div>
            <p className="text-white/70 text-sm">
              Dodge incoming bullets from all directions and survive as long as
              possible.
            </p>
          </div>

          <div className="glass rounded-2xl p-6 text-left">
            <div className="flex items-center gap-3 mb-3">
              <MousePointer className="text-green-400" size={24} />
              <h3 className="text-lg font-semibold text-white">Controls</h3>
            </div>
            <div className="space-y-2 text-sm text-white/70">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <ArrowUp size={16} />
                  <ArrowDown size={16} />
                  <ArrowLeft size={16} />
                  <ArrowRight size={16} />
                </div>
                <span>Arrow Keys</span>
              </div>
              <div className="flex items-center gap-2">
                <MousePointer size={16} />
                <span>Mouse Drag</span>
              </div>
            </div>
          </div>

          <div className="glass rounded-2xl p-6 text-left">
            <div className="flex items-center gap-3 mb-3">
              <Zap className="text-yellow-400" size={24} />
              <h3 className="text-lg font-semibold text-white">Scoring</h3>
            </div>
            <p className="text-white/70 text-sm">
              Score increases over time. Every 100 points increases game speed
              and difficulty.
            </p>
          </div>
        </motion.div>

        {/* 최고점수 표시 */}
        {highScore > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mb-8"
          >
            <div className="glass rounded-2xl p-4 inline-block">
              <div className="flex items-center gap-2 text-white/70">
                <Trophy className="text-yellow-400" size={20} />
                <span className="text-sm">High Score:</span>
                <span className="text-xl font-bold gradient-text">
                  {highScore.toLocaleString()}
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* 시작 버튼 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.0 }}
        >
          <Button
            onClick={onStart}
            variant="primary"
            size="lg"
            icon={Play}
            className="text-lg px-12 py-4"
          >
            Start Game
          </Button>
        </motion.div>

        {/* 추가 안내 */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="text-sm text-white/50 mt-6"
        >
          Press SPACEBAR to pause during gameplay
        </motion.p>
      </motion.div>
    </motion.div>
  );
};

export default StartScreen;
