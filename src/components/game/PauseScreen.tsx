import React from "react";
import { motion } from "framer-motion";
import { Play, RotateCcw, Home } from "lucide-react";
import Button from "../ui/Button";

interface PauseScreenProps {
  onResume: () => void;
  onRestart: () => void;
  onHome: () => void;
}

const PauseScreen: React.FC<PauseScreenProps> = ({
  onResume,
  onRestart,
  onHome,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 50 }}
        transition={{ duration: 0.4, type: "spring", damping: 20 }}
        className="glass-strong rounded-3xl p-8 max-w-md w-full text-center"
      >
        {/* 일시정지 아이콘 */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            duration: 0.5,
            delay: 0.2,
            type: "spring",
            damping: 10,
          }}
          className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center"
        >
          <Play size={32} className="text-white ml-1" />
        </motion.div>

        {/* 제목 */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-3xl font-bold gradient-text mb-4"
        >
          Game Paused
        </motion.h2>

        {/* 안내 메시지 */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-white/70 mb-8"
        >
          Press SPACEBAR or click Continue to resume
        </motion.p>

        {/* 버튼들 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="flex flex-col gap-4"
        >
          <Button
            onClick={onResume}
            variant="primary"
            size="lg"
            icon={Play}
            className="w-full"
          >
            Continue
          </Button>

          <div className="flex gap-4">
            <Button
              onClick={onRestart}
              variant="secondary"
              size="md"
              icon={RotateCcw}
              className="flex-1"
            >
              Restart
            </Button>
            <Button
              onClick={onHome}
              variant="ghost"
              size="md"
              icon={Home}
              className="flex-1"
            >
              Home
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default PauseScreen;
