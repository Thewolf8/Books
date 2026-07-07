import {useEffect, useState} from 'react';
import {initializeDatabase} from '@database/init';

export const useDatabase = () => {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        await initializeDatabase();
        setIsReady(true);
      } catch (err) {
        setError('Failed to initialize database');
        setIsReady(false);
      }
    };

    init();
  }, []);

  return {isReady, error};
};
