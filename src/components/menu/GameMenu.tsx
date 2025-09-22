import { motion } from "framer-motion";
import { GameInfo, GameType } from "../../types/game";

interface GameMenuProps {
  onSelectGame: (gameType: GameType) => void;
  onBackToGame?: () => void;
  showBackButton?: boolean;
}

/**
 * 게임 선택 메뉴 컴포넌트
 * 사용자가 플레이할 게임을 선택할 수 있는 메뉴를 제공합니다.
 */
const GameMenu: React.FC<GameMenuProps> = ({
  onSelectGame,
  onBackToGame,
  showBackButton = false,
}) => {
  // 게임 목록 정의
  const games: GameInfo[] = [
    {
      id: "dodge-bullets",
      name: "Dodge Bullets",
      description: "총알을 피하며 살아남는 액션 게임",
      icon: "🎯",
      color: "from-red-500 to-pink-500",
      difficulty: "medium",
      controls: ["화살표 키 또는 마우스로 이동", "SPACE로 일시정지"],
    },
    {
      id: "snake",
      name: "Snake",
      description: "뱀을 조종하여 먹이를 먹고 성장시키는 게임",
      icon: "🐍",
      color: "from-green-500 to-emerald-500",
      difficulty: "easy",
      controls: ["화살표 키로 이동", "SPACE로 일시정지"],
    },
    {
      id: "tetris",
      name: "Tetris",
      description: "블록을 맞춰서 줄을 완성하는 퍼즐 게임",
      icon: "🧩",
      color: "from-blue-500 to-cyan-500",
      difficulty: "hard",
      controls: ["화살표 키로 이동/회전", "SPACE로 빠른 낙하"],
    },
    {
      id: "pong",
      name: "Pong",
      description: "AI와 탁구를 치는 클래식 게임",
      icon: "🏓",
      color: "from-purple-500 to-violet-500",
      difficulty: "medium",
      controls: ["W/S 키로 패들 조종", "SPACE로 일시정지"],
    },
    {
      id: "breakout",
      name: "Breakout",
      description: "공으로 벽돌을 깨는 액션 게임",
      icon: "💥",
      color: "from-orange-500 to-yellow-500",
      difficulty: "easy",
      controls: ["화살표 키로 패들 조종", "SPACE로 일시정지"],
    },
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "text-green-400";
      case "medium":
        return "text-yellow-400";
      case "hard":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "쉬움";
      case "medium":
        return "보통";
      case "hard":
        return "어려움";
      default:
        return "알 수 없음";
    }
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

      {/* 메인 컨테이너 */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, type: "spring", damping: 20 }}
        className="relative w-full max-w-6xl"
      >
        {/* 헤더 */}
        <div className="text-center mb-12">
          <motion.h1
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-6xl font-bold text-white mb-4"
          >
            🎮 미니게임 컬렉션
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl text-white/70"
          >
            다양한 게임을 즐겨보세요!
          </motion.p>
        </div>

        {/* 게임 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {games.map((game, index) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 * index }}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              className="group cursor-pointer"
              onClick={() => onSelectGame(game.id)}
            >
              <div
                className={`glass rounded-2xl p-6 h-full bg-gradient-to-br ${game.color} bg-opacity-20 border border-white/10 hover:border-white/30 transition-all duration-300`}
              >
                {/* 게임 아이콘 */}
                <div className="text-6xl mb-4 text-center group-hover:scale-110 transition-transform duration-300">
                  {game.icon}
                </div>

                {/* 게임 정보 */}
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-white/90">
                    {game.name}
                  </h3>
                  <p className="text-white/70 mb-4 text-sm leading-relaxed">
                    {game.description}
                  </p>

                  {/* 난이도 표시 */}
                  <div className="flex items-center justify-center mb-4">
                    <span className="text-sm text-white/50 mr-2">난이도:</span>
                    <span
                      className={`text-sm font-medium ${getDifficultyColor(
                        game.difficulty
                      )}`}
                    >
                      {getDifficultyText(game.difficulty)}
                    </span>
                  </div>

                  {/* 컨트롤 정보 */}
                  <div className="space-y-1">
                    {game.controls.map((control) => (
                      <div
                        key={control}
                        className="text-xs text-white/60 bg-white/5 rounded px-2 py-1"
                      >
                        {control}
                      </div>
                    ))}
                  </div>
                </div>

                {/* 호버 효과 */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* 뒤로가기 버튼 */}
        {showBackButton && onBackToGame && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-center"
          >
            <button
              onClick={onBackToGame}
              className="glass rounded-xl px-8 py-3 text-white hover:bg-white/10 transition-all duration-300 flex items-center justify-center mx-auto"
            >
              <span className="mr-2">←</span>
              게임으로 돌아가기
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default GameMenu;
