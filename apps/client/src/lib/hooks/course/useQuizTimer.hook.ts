import { useState, useEffect, useCallback, useRef } from 'react';

interface QuizTimerState {
    startTime: number;
    durationInMinutes: number;
}

export function useQuizTimer(quizId: string, durationInMinutes: number) {
    const [timeRemaining, setTimeRemaining] = useState<number>(durationInMinutes * 60);
    const [hasStarted, setHasStarted] = useState(false);
    const [isExpired, setIsExpired] = useState(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const storageKey = `quiz_timer_${quizId}`;

    // Load timer state from localStorage
    const loadTimerState = useCallback((): QuizTimerState | null => {
        if (typeof window === 'undefined') return null;

        try {
            const saved = localStorage.getItem(storageKey);
            if (!saved) return null;

            return JSON.parse(saved) as QuizTimerState;
        } catch (error) {
            console.error('Failed to load timer state:', error);
            return null;
        }
    }, [storageKey]);

    // Save timer state to localStorage
    const saveTimerState = useCallback((state: QuizTimerState) => {
        if (typeof window === 'undefined') return;

        try {
            localStorage.setItem(storageKey, JSON.stringify(state));
        } catch (error) {
            console.error('Failed to save timer state:', error);
        }
    }, [storageKey]);

    // Clear timer from localStorage
    const clearTimer = useCallback(() => {
        if (typeof window === 'undefined') return;

        try {
            localStorage.removeItem(storageKey);
        } catch (error) {
            console.error('Failed to clear timer:', error);
        }
    }, [storageKey]);

    // Calculate elapsed seconds since start
    const getElapsedSeconds = useCallback((): number => {
        const state = loadTimerState();
        if (!state) return 0;

        const now = Date.now();
        const elapsed = Math.floor((now - state.startTime) / 1000);
        return Math.min(elapsed, state.durationInMinutes * 60);
    }, [loadTimerState]);

    // Start the timer
    const startTimer = useCallback(() => {
        if (durationInMinutes <= 0) return;

        let state = loadTimerState();

        // If no saved state or saved state is from different quiz, create new state
        if (!state || state.durationInMinutes !== durationInMinutes) {
            state = {
                startTime: Date.now(),
                durationInMinutes
            };
            saveTimerState(state);
        }

        setHasStarted(true);

        // Calculate initial time remaining
        const elapsed = getElapsedSeconds();
        const remaining = Math.max(0, (durationInMinutes * 60) - elapsed);
        setTimeRemaining(remaining);

        if (remaining <= 0) {
            setIsExpired(true);
            return;
        }
    }, [durationInMinutes, loadTimerState, saveTimerState, getElapsedSeconds]);

    // Update timer every second
    useEffect(() => {
        if (!hasStarted || durationInMinutes <= 0 || isExpired) {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
            return;
        }

        intervalRef.current = setInterval(() => {
            const elapsed = getElapsedSeconds();
            const remaining = Math.max(0, (durationInMinutes * 60) - elapsed);

            setTimeRemaining(remaining);

            if (remaining <= 0) {
                setIsExpired(true);
                if (intervalRef.current) {
                    clearInterval(intervalRef.current);
                    intervalRef.current = null;
                }
            }
        }, 1000);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [hasStarted, durationInMinutes, isExpired, getElapsedSeconds]);

    // Handle page visibility change (tab switching)
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible' && hasStarted && !isExpired) {
                // Recalculate time when tab becomes visible again
                const elapsed = getElapsedSeconds();
                const remaining = Math.max(0, (durationInMinutes * 60) - elapsed);
                setTimeRemaining(remaining);

                if (remaining <= 0) {
                    setIsExpired(true);
                }
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [hasStarted, isExpired, durationInMinutes, getElapsedSeconds]);

    // Warn before unload if quiz is in progress
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (hasStarted && !isExpired && timeRemaining > 0) {
                e.preventDefault();
                e.returnValue = 'Your quiz is still in progress. Are you sure you want to leave?';
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [hasStarted, isExpired, timeRemaining]);

    return {
        timeRemaining,
        hasStarted,
        isExpired,
        startTimer,
        getElapsedSeconds,
        clearTimer
    };
}