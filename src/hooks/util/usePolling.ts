import { useEffect, useState } from 'react';
import { useInterval } from './useInterval';
import { useVisibilityChange } from './useVisibilityChange';

const POLLING_INTERVAL = 1000 * 180;

export const usePolling = (refresh: () => void, interval: number = POLLING_INTERVAL) => {
  const [pollingInterval, setPollingInterval] = useState<number | null>(POLLING_INTERVAL);
  const [active, setActive] = useState<boolean>(false);
  const isPageVisible = useVisibilityChange();

  useEffect(() => {
    if (isPageVisible && active) {
      setPollingInterval(interval);
    } else {
      setPollingInterval(null);
    }
  }, [isPageVisible, active, interval]);

  useInterval(() => {
    refresh();
  }, pollingInterval);

  const start = () => {
    setActive(true);
  };
  const stop = () => {
    setActive(false);
  };

  return {
    start,
    stop,
  };
};
