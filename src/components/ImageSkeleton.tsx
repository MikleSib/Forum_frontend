import React from 'react';
import { Box, Skeleton } from '@mui/material';
import { keyframes } from '@mui/system';

// Анимация пульсации как в ВК
const shimmer = keyframes`
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
`;

// Анимация волны
const wave = keyframes`
  0% {
    transform: translateX(-100%);
  }
  50% {
    transform: translateX(100%);
  }
  100% {
    transform: translateX(100%);
  }
`;

interface ImageSkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  variant?: 'wave' | 'pulse';
}

const ImageSkeleton: React.FC<ImageSkeletonProps> = ({
  width = '100%',
  height = 200,
  borderRadius = 1,
  variant = 'wave'
}) => {
  if (variant === 'wave') {
    return (
      <Box
        sx={{
          width,
          height,
          borderRadius,
          position: 'relative',
          overflow: 'hidden',
          backgroundColor: '#f0f0f0',
          background: `
            linear-gradient(
              90deg,
              #f0f0f0 25%,
              #e0e0e0 37%,
              #f0f0f0 63%
            )
          `,
          backgroundSize: '400% 100%',
          animation: `${shimmer} 1.4s ease-in-out infinite`,
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            background: `
              linear-gradient(
                90deg,
                transparent,
                rgba(255, 255, 255, 0.6),
                transparent
              )
            `,
            transform: 'translateX(-100%)',
            animation: `${wave} 2s infinite`,
          }
        }}
      >
        {/* Центральная иконка камеры */}
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: 'rgba(0, 0, 0, 0.1)',
            fontSize: '2rem',
            '&::before': {
              content: '"📷"',
              fontSize: '2rem',
              opacity: 0.3,
            }
          }}
        />
      </Box>
    );
  }

  // Вариант с пульсацией (стандартный Skeleton)
  return (
    <Skeleton
      variant="rectangular"
      width={width}
      height={height}
      sx={{
        borderRadius,
        backgroundColor: '#f0f0f0',
        '&::after': {
          background: `
            linear-gradient(
              90deg,
              transparent,
              rgba(255, 255, 255, 0.4),
              transparent
            )
          `,
        }
      }}
    />
  );
};

export default ImageSkeleton; 