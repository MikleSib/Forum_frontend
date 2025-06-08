import React from 'react';
import AnimatedBackground from './AnimatedBackground';

// Мемоизированный компонент фона, который не будет перерендериваться
// при изменениях в других частях приложения
const PersistentBackground = React.memo(() => {
  return <AnimatedBackground />;
});

PersistentBackground.displayName = 'PersistentBackground';

export default PersistentBackground; 