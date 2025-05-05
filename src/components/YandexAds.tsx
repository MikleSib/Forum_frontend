import React, { useEffect, useRef } from 'react';
import { Paper } from '@mui/material';

// Расширяем интерфейс Window для добавления типов Яндекс.РСЯ
declare global {
  interface Window {
    yaContextCb?: Array<() => void>;
    Ya?: {
      Context: {
        AdvManager: {
          render: (params: { blockId: string; renderTo: string }) => void;
        };
      };
    };
  }
}

interface YandexAdsProps {
  blockId: string;
}

const YandexAds: React.FC<YandexAdsProps> = ({ blockId }) => {
  const containerId = `yandex_rtb_${blockId}`;
  const isInitialized = useRef(false);

  useEffect(() => {
    if (!isInitialized.current && window.yaContextCb) {
      window.yaContextCb.push(() => {
        if (window.Ya && window.Ya.Context) {
          window.Ya.Context.AdvManager.render({
            blockId: blockId,
            renderTo: containerId
          });
        }
      });
      isInitialized.current = true;
    }
  }, [blockId, containerId]);

  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <div id={containerId}></div>
    </Paper>
  );
};

export default YandexAds; 