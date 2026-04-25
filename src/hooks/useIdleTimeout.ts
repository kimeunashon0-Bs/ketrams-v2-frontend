import { useEffect, useRef } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';

export function useIdleTimeout(timeoutMinutes = 30) {
  const { logout } = useAuth();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      logout();
      alert('You have been logged out due to inactivity.');
    }, timeoutMinutes * 60 * 1000);
  };

  useEffect(() => {
    const events = ['mousemove', 'keydown', 'click', 'scroll'];
    const handleEvent = () => resetTimer();
    events.forEach(event => window.addEventListener(event, handleEvent));
    resetTimer();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      events.forEach(event => window.removeEventListener(event, handleEvent));
    };
  }, []);
}