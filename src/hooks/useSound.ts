import { useCallback, useRef } from "react";

// 사운드 타입 정의
export type SoundType =
  | "bullet" // 총알 발사
  | "explosion" // 폭발
  | "gameOver" // 게임 오버
  | "eat" // 먹이 획득
  | "hit" // 부딪힘
  | "boost" // 부스트
  | "move" // 블록 이동
  | "rotate" // 블록 회전
  | "lineClear" // 줄 완성
  | "brickBreak" // 벽돌 파괴
  | "paddleHit" // 패들 충돌
  | "ballLaunch" // 공 발사
  | "button" // 버튼 클릭
  | "pause" // 일시정지
  | "resume"; // 재개

interface SoundConfig {
  frequency: number;
  duration: number;
  volume: number;
  type: OscillatorType;
  attack?: number;
  decay?: number;
}

// 사운드 설정
const SOUND_CONFIGS: Record<SoundType, SoundConfig> = {
  bullet: {
    frequency: 800,
    duration: 0.1,
    volume: 0.3,
    type: "square",
    attack: 0.01,
    decay: 0.05,
  },
  explosion: {
    frequency: 200,
    duration: 0.3,
    volume: 0.5,
    type: "sawtooth",
    attack: 0.01,
    decay: 0.2,
  },
  gameOver: {
    frequency: 150,
    duration: 1.0,
    volume: 0.6,
    type: "sawtooth",
    attack: 0.1,
    decay: 0.8,
  },
  eat: {
    frequency: 600,
    duration: 0.15,
    volume: 0.4,
    type: "sine",
    attack: 0.01,
    decay: 0.1,
  },
  hit: {
    frequency: 300,
    duration: 0.2,
    volume: 0.5,
    type: "square",
    attack: 0.01,
    decay: 0.15,
  },
  boost: {
    frequency: 1000,
    duration: 0.1,
    volume: 0.3,
    type: "sine",
    attack: 0.01,
    decay: 0.05,
  },
  move: {
    frequency: 400,
    duration: 0.05,
    volume: 0.2,
    type: "sine",
    attack: 0.01,
    decay: 0.03,
  },
  rotate: {
    frequency: 500,
    duration: 0.1,
    volume: 0.3,
    type: "sine",
    attack: 0.01,
    decay: 0.05,
  },
  lineClear: {
    frequency: 800,
    duration: 0.4,
    volume: 0.6,
    type: "sine",
    attack: 0.01,
    decay: 0.3,
  },
  brickBreak: {
    frequency: 400,
    duration: 0.1,
    volume: 0.4,
    type: "square",
    attack: 0.01,
    decay: 0.05,
  },
  paddleHit: {
    frequency: 600,
    duration: 0.1,
    volume: 0.4,
    type: "sine",
    attack: 0.01,
    decay: 0.05,
  },
  ballLaunch: {
    frequency: 700,
    duration: 0.2,
    volume: 0.5,
    type: "sine",
    attack: 0.01,
    decay: 0.15,
  },
  button: {
    frequency: 500,
    duration: 0.1,
    volume: 0.3,
    type: "sine",
    attack: 0.01,
    decay: 0.05,
  },
  pause: {
    frequency: 300,
    duration: 0.2,
    volume: 0.4,
    type: "sine",
    attack: 0.01,
    decay: 0.15,
  },
  resume: {
    frequency: 500,
    duration: 0.2,
    volume: 0.4,
    type: "sine",
    attack: 0.01,
    decay: 0.15,
  },
};

export const useSound = () => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const isMutedRef = useRef(false);

  // 오디오 컨텍스트 초기화
  const initAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  // 사운드 재생
  const playSound = useCallback(
    (soundType: SoundType) => {
      if (isMutedRef.current) return;

      try {
        const audioContext = initAudioContext();
        const config = SOUND_CONFIGS[soundType];

        // 오디오 컨텍스트가 일시정지 상태면 재개
        if (audioContext.state === "suspended") {
          audioContext.resume();
        }

        // 오실레이터 노드 생성
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        // 노드 연결
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        // 오실레이터 설정
        oscillator.type = config.type;
        oscillator.frequency.setValueAtTime(
          config.frequency,
          audioContext.currentTime
        );

        // 게인 설정 (볼륨 및 ADSR)
        const now = audioContext.currentTime;
        const attackTime = config.attack || 0.01;
        const decayTime = config.decay || 0.1;
        const sustainLevel = 0.7;

        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(config.volume, now + attackTime);
        gainNode.gain.linearRampToValueAtTime(
          config.volume * sustainLevel,
          now + attackTime + decayTime
        );
        gainNode.gain.linearRampToValueAtTime(0, now + config.duration);

        // 사운드 재생
        oscillator.start(now);
        oscillator.stop(now + config.duration);

        // 특별한 효과들
        if (soundType === "explosion") {
          // 폭발음에 노이즈 추가
          const noiseBuffer = audioContext.createBuffer(
            1,
            audioContext.sampleRate * 0.1,
            audioContext.sampleRate
          );
          const noiseData = noiseBuffer.getChannelData(0);
          for (let i = 0; i < noiseData.length; i++) {
            noiseData[i] = Math.random() * 2 - 1;
          }
          const noiseSource = audioContext.createBufferSource();
          noiseSource.buffer = noiseBuffer;
          const noiseGain = audioContext.createGain();
          noiseGain.gain.setValueAtTime(0.1, now);
          noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
          noiseSource.connect(noiseGain);
          noiseGain.connect(audioContext.destination);
          noiseSource.start(now);
          noiseSource.stop(now + 0.1);
        }

        if (soundType === "lineClear") {
          // 줄 완성 시 멜로디
          const frequencies = [800, 1000, 1200, 800];
          frequencies.forEach((freq, index) => {
            const osc = audioContext.createOscillator();
            const gain = audioContext.createGain();
            osc.connect(gain);
            gain.connect(audioContext.destination);
            osc.type = "sine";
            osc.frequency.setValueAtTime(freq, now + index * 0.1);
            gain.gain.setValueAtTime(0, now + index * 0.1);
            gain.gain.linearRampToValueAtTime(0.3, now + index * 0.1 + 0.01);
            gain.gain.linearRampToValueAtTime(0, now + index * 0.1 + 0.15);
            osc.start(now + index * 0.1);
            osc.stop(now + index * 0.1 + 0.15);
          });
        }
      } catch (error) {
        console.warn("사운드 재생 실패:", error);
      }
    },
    [initAudioContext]
  );

  // 음소거 토글
  const toggleMute = useCallback(() => {
    isMutedRef.current = !isMutedRef.current;
    return isMutedRef.current;
  }, []);

  // 음소거 상태 확인
  const isMuted = useCallback(() => {
    return isMutedRef.current;
  }, []);

  return {
    playSound,
    toggleMute,
    isMuted,
  };
};
