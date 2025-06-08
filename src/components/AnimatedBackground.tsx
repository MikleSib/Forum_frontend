import React from 'react';
import { Box, keyframes } from '@mui/material';

// Анимации для рыбок
const swimAnimation1 = keyframes`
  0% {
    transform: translateX(-200px) translateY(0px) rotate(0deg);
  }
  25% {
    transform: translateX(calc(25vw - 100px)) translateY(-20px) rotate(5deg);
  }
  50% {
    transform: translateX(calc(50vw - 50px)) translateY(10px) rotate(-3deg);
  }
  75% {
    transform: translateX(calc(75vw)) translateY(-15px) rotate(2deg);
  }
  100% {
    transform: translateX(calc(100vw + 200px)) translateY(5px) rotate(0deg);
  }
`;

const swimAnimation2 = keyframes`
  0% {
    transform: translateX(calc(100vw + 200px)) translateY(0px) rotate(180deg);
  }
  25% {
    transform: translateX(calc(75vw + 100px)) translateY(15px) rotate(175deg);
  }
  50% {
    transform: translateX(calc(50vw + 50px)) translateY(-10px) rotate(185deg);
  }
  75% {
    transform: translateX(calc(25vw)) translateY(20px) rotate(178deg);
  }
  100% {
    transform: translateX(-200px) translateY(-5px) rotate(180deg);
  }
`;

const bubbleAnimation = keyframes`
  0% {
    transform: translateY(100vh) scale(0);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    transform: translateY(-100px) scale(1);
    opacity: 0;
  }
`;

const waveAnimation = keyframes`
  0% {
    transform: translateX(0px) translateY(0px);
  }
  50% {
    transform: translateX(-25px) translateY(-10px);
  }
  100% {
    transform: translateX(0px) translateY(0px);
  }
`;

const jellyfishAnimation = keyframes`
  0% {
    transform: translateY(0px) translateX(0px) rotate(0deg);
    opacity: 0.8;
  }
  25% {
    transform: translateY(-25vh) translateX(15px) rotate(2deg);
    opacity: 0.9;
  }
  50% {
    transform: translateY(-50vh) translateX(30px) rotate(5deg);
    opacity: 0.9;
  }
  75% {
    transform: translateY(-75vh) translateX(-10px) rotate(-2deg);
    opacity: 0.8;
  }
  100% {
    transform: translateY(-100vh) translateX(-20px) rotate(-3deg);
    opacity: 0;
  }
`;

const jellyfishPulse = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
`;

// SVG рыбки
const FishSVG = ({ size = 40, color = "#4A90E2" }) => (
  <svg width={size} height={size * 0.6} viewBox="0 0 100 60" fill="none">
    {/* Тело рыбки */}
    <ellipse cx="35" cy="30" rx="25" ry="15" fill={color} opacity="0.8"/>
    {/* Хвост */}
    <path d="M10 30 L0 20 L5 30 L0 40 Z" fill={color} opacity="0.7"/>
    {/* Плавники */}
    <ellipse cx="35" cy="45" rx="8" ry="4" fill={color} opacity="0.6"/>
    <ellipse cx="35" cy="15" rx="8" ry="4" fill={color} opacity="0.6"/>
    {/* Глаз */}
    <circle cx="45" cy="25" r="4" fill="white"/>
    <circle cx="47" cy="23" r="2" fill="#333"/>
  </svg>
);

// SVG медузы
const JellyfishSVG = ({ size = 60, color = "#E1BEE7" }) => (
  <svg width={size} height={size * 1.2} viewBox="0 0 100 120" fill="none">
    {/* Купол медузы */}
    <ellipse cx="50" cy="35" rx="35" ry="25" fill={color} opacity="0.6"/>
    <ellipse cx="50" cy="35" rx="30" ry="20" fill={color} opacity="0.4"/>
    <ellipse cx="50" cy="35" rx="25" ry="15" fill={color} opacity="0.3"/>
    
    {/* Внутренние узоры */}
    <circle cx="50" cy="30" r="8" fill="rgba(255,255,255,0.3)"/>
    <circle cx="50" cy="30" r="4" fill="rgba(255,255,255,0.5)"/>
    
    {/* Щупальца */}
    <path d="M35 55 Q32 70 35 85 Q38 100 35 115" stroke={color} strokeWidth="2" fill="none" opacity="0.7"/>
    <path d="M45 55 Q42 75 45 90 Q48 105 45 120" stroke={color} strokeWidth="2" fill="none" opacity="0.7"/>
    <path d="M55 55 Q58 75 55 90 Q52 105 55 120" stroke={color} strokeWidth="2" fill="none" opacity="0.7"/>
    <path d="M65 55 Q68 70 65 85 Q62 100 65 115" stroke={color} strokeWidth="2" fill="none" opacity="0.7"/>
    
    {/* Дополнительные тонкие щупальца */}
    <path d="M40 55 Q37 80 40 95 Q43 110 40 118" stroke={color} strokeWidth="1" fill="none" opacity="0.5"/>
    <path d="M50 55 Q47 80 50 95 Q53 110 50 118" stroke={color} strokeWidth="1" fill="none" opacity="0.5"/>
    <path d="M60 55 Q63 80 60 95 Q57 110 60 118" stroke={color} strokeWidth="1" fill="none" opacity="0.5"/>
  </svg>
);

// SVG камушка
const RockSVG = ({ size = 30, color = "#5D4037" }) => (
  <svg width={size} height={size * 0.7} viewBox="0 0 100 70" fill="none">
    <ellipse cx="50" cy="50" rx="45" ry="20" fill={color} opacity="0.8"/>
    <ellipse cx="50" cy="45" rx="40" ry="18" fill={color} opacity="0.9"/>
    <ellipse cx="50" cy="40" rx="35" ry="15" fill={color}/>
    {/* Блики */}
    <ellipse cx="35" cy="35" rx="8" ry="4" fill="rgba(255,255,255,0.2)"/>
    <ellipse cx="60" cy="38" rx="6" ry="3" fill="rgba(255,255,255,0.15)"/>
  </svg>
);

// SVG ракушки
const ShellSVG = ({ size = 25, color = "#FFAB91" }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    {/* Основа ракушки */}
    <path d="M50 20 Q30 40 25 70 Q35 85 50 90 Q65 85 75 70 Q70 40 50 20 Z" fill={color} opacity="0.9"/>
    {/* Ребра ракушки */}
    <path d="M50 25 Q40 45 35 75" stroke="rgba(0,0,0,0.2)" strokeWidth="1" fill="none"/>
    <path d="M50 25 Q50 50 50 80" stroke="rgba(0,0,0,0.2)" strokeWidth="1" fill="none"/>
    <path d="M50 25 Q60 45 65 75" stroke="rgba(0,0,0,0.2)" strokeWidth="1" fill="none"/>
    {/* Блик */}
    <ellipse cx="45" cy="40" rx="6" ry="8" fill="rgba(255,255,255,0.3)"/>
  </svg>
);

// SVG морской звезды
const StarfishSVG = ({ size = 35, color = "#FF7043" }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <path d="M50 10 L60 35 L85 35 L67 52 L75 80 L50 65 L25 80 L33 52 L15 35 L40 35 Z" fill={color} opacity="0.8"/>
    <path d="M50 10 L60 35 L85 35 L67 52 L75 80 L50 65 L25 80 L33 52 L15 35 L40 35 Z" fill={color} opacity="0.6"/>
    {/* Центральный узор */}
    <circle cx="50" cy="50" r="8" fill="rgba(255,255,255,0.2)"/>
    <circle cx="50" cy="50" r="4" fill="rgba(255,255,255,0.3)"/>
  </svg>
);

// Пузырьки
const Bubble = ({ size = 10, delay = 0 }) => (
  <Box
    sx={{
      position: 'absolute',
      width: size,
      height: size,
      borderRadius: '50%',
      background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.4), rgba(135,206,235,0.15))',
      animation: `${bubbleAnimation} ${8 + Math.random() * 4}s infinite linear`,
      animationDelay: `${delay}s`,
      left: `${Math.random() * 100}%`,
    }}
  />
);

// Генерируем рыбок и пузырьки один раз вне компонента
const fishes = Array.from({ length: 6 }, (_, i) => ({
  id: i,
  size: 50 + Math.random() * 30, // Увеличил размер рыбок
  color: ['rgba(74,144,226,0.4)', 'rgba(92,179,204,0.4)', 'rgba(127,176,105,0.4)', 'rgba(244,162,97,0.4)', 'rgba(231,111,81,0.4)', 'rgba(42,157,143,0.4)'][i],
  animationDuration: 25 + Math.random() * 15, // Замедлил анимацию (было 15 + Math.random() * 10)
  delay: i * 4, // Увеличил задержку между рыбками
  top: 20 + Math.random() * 60,
  animation: i % 2 === 0 ? swimAnimation1 : swimAnimation2,
}));

const bubbles = Array.from({ length: 15 }, (_, i) => ({
  id: i,
  size: 5 + Math.random() * 10,
  delay: Math.random() * 8,
}));

const jellyfishes = Array.from({ length: 5 }, (_, i) => ({
  id: i,
  size: 40 + Math.random() * 30,
  color: ['rgba(225,190,231,0.3)', 'rgba(248,187,217,0.3)', 'rgba(179,157,219,0.3)', 'rgba(129,199,132,0.3)', 'rgba(206,147,216,0.3)'][i],
  animationDuration: 30 + Math.random() * 15, // Увеличил время анимации, чтобы медузы успевали доплыть до верха
  delay: i === 0 ? 0 : i * 2 + Math.random() * 2, // Первая медуза без задержки
  left: 10 + Math.random() * 80, // Позиция по горизонтали
  pulseDelay: Math.random() * 3,
}));

// Морские объекты на дне
const seaFloorObjects = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  type: ['rock', 'shell', 'starfish'][Math.floor(Math.random() * 3)],
  size: 20 + Math.random() * 25,
  left: Math.random() * 95,
  bottom: -5 + Math.random() * 8, // Опустил ниже, чтобы частично уходили под край экрана
  color: i % 3 === 0 ? '#5D4037' : i % 3 === 1 ? '#FFAB91' : '#FF7043',
}));

const AnimatedBackground: React.FC = () => {

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -1,
        overflow: 'hidden',
        background: `
          radial-gradient(circle at 20% 30%, rgba(200,220,255,0.3) 0%, transparent 50%),
          radial-gradient(circle at 80% 30%, rgba(200,220,255,0.3) 0%, transparent 50%),
          radial-gradient(circle at 15% 20%, rgba(220,255,220,0.2) 0%, transparent 40%),
          radial-gradient(circle at 85% 20%, rgba(220,255,220,0.2) 0%, transparent 40%),
          radial-gradient(circle at 10% 70%, rgba(255,220,220,0.2) 0%, transparent 45%),
          radial-gradient(circle at 90% 70%, rgba(255,220,220,0.2) 0%, transparent 45%),
          radial-gradient(circle at 25% 80%, rgba(255,255,200,0.2) 0%, transparent 35%),
          radial-gradient(circle at 75% 80%, rgba(255,255,200,0.2) 0%, transparent 35%),
          radial-gradient(circle at 5% 50%, rgba(220,200,255,0.2) 0%, transparent 40%),
          radial-gradient(circle at 95% 50%, rgba(220,200,255,0.2) 0%, transparent 40%),
          linear-gradient(135deg, #F8F9FA 0%, #FFFFFF 50%, #F5F5F5 100%)
        `,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(circle at 60% 40%, rgba(255,255,255,0.4) 0%, transparent 30%),
            radial-gradient(circle at 30% 60%, rgba(240,240,240,0.3) 0%, transparent 35%)
          `,
          animation: `${waveAnimation} 25s ease-in-out infinite`,
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.1) 0%, transparent 70%),
            radial-gradient(ellipse at 50% 100%, rgba(245,245,245,0.1) 0%, transparent 70%)
          `,
          animation: `${waveAnimation} 30s ease-in-out infinite reverse`,
        }
      }}
    >
      {/* Рыбки */}
      {fishes.map((fish) => (
        <Box
          key={fish.id}
          sx={{
            position: 'absolute',
            top: `${fish.top}%`,
            left: fish.id % 2 === 0 ? '-200px' : 'calc(100vw + 200px)', // Начальная позиция за экраном
            animation: `${fish.animation} ${fish.animationDuration}s linear infinite`,
            animationDelay: `${fish.delay}s`,
            zIndex: 1,
          }}
        >
          <FishSVG size={fish.size} color={fish.color} />
        </Box>
      ))}

      {/* Пузырьки */}
      {bubbles.map((bubble) => (
        <Bubble key={bubble.id} size={bubble.size} delay={bubble.delay} />
      ))}

      {/* Медузы */}
      {jellyfishes.map((jellyfish) => (
        <Box
          key={jellyfish.id}
          sx={{
            position: 'absolute',
            left: `${jellyfish.left}%`,
            bottom: '0px', // Спавн медуз у нижнего края экрана
            animation: `${jellyfishAnimation} ${jellyfish.animationDuration}s linear infinite`,
            animationDelay: `${jellyfish.delay}s`,
            '& > svg': {
              animation: `${jellyfishPulse} 3s ease-in-out infinite`,
              animationDelay: `${jellyfish.pulseDelay}s`,
            }
          }}
        >
          <JellyfishSVG size={jellyfish.size} color={jellyfish.color} />
        </Box>
      ))}

      {/* Морские объекты на дне */}
      {seaFloorObjects.map((obj) => (
        <Box
          key={obj.id}
          sx={{
            position: 'absolute',
            left: `${obj.left}%`,
            bottom: `${obj.bottom}px`,
            zIndex: 0,
            '& > svg': {
              animation: `${waveAnimation} ${8 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 3}s`,
            }
          }}
        >
          {obj.type === 'rock' && <RockSVG size={obj.size} color={obj.color} />}
          {obj.type === 'shell' && <ShellSVG size={obj.size} color={obj.color} />}
          {obj.type === 'starfish' && <StarfishSVG size={obj.size} color={obj.color} />}
        </Box>
      ))}

      {/* Водные растения (декоративные элементы) */}
      <Box
        sx={{
          position: 'absolute',
          bottom: '-20px', // Опустил ниже
          left: '8%',
          width: '80px',
          height: '140px',
          background: 'linear-gradient(0deg, #2E7D32 0%, #4CAF50 50%, #66BB6A 100%)',
          clipPath: 'polygon(40% 100%, 45% 80%, 35% 60%, 50% 40%, 30% 20%, 45% 0%, 55% 0%, 70% 20%, 50% 40%, 65% 60%, 55% 80%, 60% 100%)',
          opacity: 0.4,
          animation: `${waveAnimation} 8s ease-in-out infinite`,
        }}
      />
      
      <Box
        sx={{
          position: 'absolute',
          bottom: '-15px', // Опустил ниже
          right: '12%',
          width: '60px',
          height: '110px',
          background: 'linear-gradient(0deg, #388E3C 0%, #66BB6A 50%, #81C784 100%)',
          clipPath: 'polygon(45% 100%, 50% 85%, 40% 70%, 55% 50%, 35% 30%, 50% 10%, 65% 30%, 45% 50%, 60% 70%, 50% 85%, 55% 100%)',
          opacity: 0.4,
          animation: `${waveAnimation} 12s ease-in-out infinite reverse`,
        }}
      />

      <Box
        sx={{
          position: 'absolute',
          bottom: '-10px', // Опустил ниже
          left: '25%',
          width: '50px',
          height: '90px',
          background: 'linear-gradient(0deg, #1B5E20 0%, #388E3C 50%, #4CAF50 100%)',
          clipPath: 'polygon(45% 100%, 50% 85%, 40% 70%, 55% 50%, 35% 30%, 50% 10%, 65% 30%, 45% 50%, 60% 70%, 50% 85%, 55% 100%)',
          opacity: 0.3,
          animation: `${waveAnimation} 10s ease-in-out infinite`,
        }}
      />

      {/* Песчаное дно */}
      <Box
        sx={{
          position: 'absolute',
          bottom: '-30px',
          left: 0,
          width: '100%',
          height: '50px',
          background: 'linear-gradient(180deg, transparent 0%, rgba(194,154,108,0.3) 50%, rgba(160,116,86,0.5) 100%)',
          zIndex: -1,
        }}
      />

      {/* Дополнительные световые эффекты */}
      <Box
        sx={{
          position: 'absolute',
          top: '10%',
          left: '20%',
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 70%)',
          animation: `${waveAnimation} 15s ease-in-out infinite`,
        }}
      />
      
      <Box
        sx={{
          position: 'absolute',
          top: '60%',
          right: '25%',
          width: '150px',
          height: '150px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(135,206,235,0.02) 0%, transparent 70%)',
          animation: `${waveAnimation} 18s ease-in-out infinite reverse`,
        }}
      />
    </Box>
  );
};

export default AnimatedBackground; 