import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  color?: "blue" | "green" | "yellow" | "red" | "purple";
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon: Icon,
  color = "blue",
  className = "",
}) => {
  // 디버깅: value 값 확인
  console.log(`StatCard - ${label}:`, value);

  const colorClasses = {
    blue: "from-blue-500/20 to-blue-600/20 border-blue-500/30 text-blue-400",
    green:
      "from-green-500/20 to-green-600/20 border-green-500/30 text-green-400",
    yellow:
      "from-yellow-500/20 to-yellow-600/20 border-yellow-500/30 text-yellow-400",
    red: "from-red-500/20 to-red-600/20 border-red-500/30 text-red-400",
    purple:
      "from-purple-500/20 to-purple-600/20 border-purple-500/30 text-purple-400",
  };

  useEffect(() => {
    console.log("value", value);
  }, [value]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`glass-strong rounded-2xl p-4 border ${colorClasses[color]} ${className}`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-white/70">{label}</span>
        {Icon && <Icon size={16} className="text-white/50" />}
      </div>
      <div className="text-2xl font-bold gradient-text">{value}</div>
    </motion.div>
  );
};

export default StatCard;
