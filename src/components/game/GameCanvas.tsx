import React from "react";
import { motion } from "framer-motion";

interface GameCanvasProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  className?: string;
}

const GameCanvas: React.FC<GameCanvasProps> = ({
  canvasRef,
  className = "",
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, type: "spring", damping: 20 }}
      className={`relative overflow-hidden rounded-3xl ${className}`}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
        style={{ background: "transparent" }}
      />

      {/* 게임 오버레이 그라디언트 */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-slate-900/50 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-slate-900/50 to-transparent" />
        <div className="absolute top-0 left-0 w-32 h-full bg-gradient-to-r from-slate-900/50 to-transparent" />
        <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-slate-900/50 to-transparent" />
      </div>
    </motion.div>
  );
};

export default GameCanvas;
