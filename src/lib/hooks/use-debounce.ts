import { CreateHook } from './types';

type UseDebounce = <T>(value: T, delay: number) => T;

export const useDebounce: CreateHook<UseDebounce> = use => (value, delay) => {
    const [debouncedValue, setDebouncedValue] = use.state(value);

    use.effect(() => {
        const timerId = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(timerId);
        };
    }, [value, delay]);

    return debouncedValue;
};
