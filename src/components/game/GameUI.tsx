import React from "react";
import { motion } from "framer-motion";
import { Play, Pause, Trophy, Zap, Target } from "lucide-react";
import StatCard from "../ui/StatCard";
import Button from "../ui/Button";
import { GameStats } from "../../types/game";

interface GameUIProps {
  stats: GameStats;
  gameState: string;
  onPause: () => void;
  onResume: () => void;
}

const GameUI: React.FC<GameUIProps> = ({
  stats,
  gameState,
  onPause,
  onResume,
}) => {
  // 디버깅: stats 값 확인
  console.log("GameUI - stats:", stats);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className="w-full"
    >
      <div className="flex justify-between items-center">
        {/* 왼쪽: 점수 */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <StatCard
            label="Score"
            value={stats.score.toLocaleString()}
            icon={Target}
            color="green"
            className="pointer-events-auto"
          />
        </motion.div>

        {/* 중앙: 게임 통계 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex gap-3"
        >
          <StatCard
            label="Speed"
            value={`${stats.gameSpeed.toFixed(1)}x`}
            icon={Zap}
            color="yellow"
            className="pointer-events-auto"
          />
          <StatCard
            label="Level"
            value={stats.level}
            icon={Trophy}
            color="purple"
            className="pointer-events-auto"
          />
        </motion.div>

        {/* 오른쪽: 일시정지 버튼과 최고점수 */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="flex items-center gap-3"
        >
          <StatCard
            label="High Score"
            value={stats.highScore.toLocaleString()}
            icon={Trophy}
            color="blue"
            className="pointer-events-auto"
          />
          <Button
            onClick={gameState === "playing" ? onPause : onResume}
            variant="secondary"
            size="sm"
            icon={gameState === "playing" ? Pause : Play}
            className="pointer-events-auto w-12 h-12 p-0 rounded-full"
          />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default GameUI;
