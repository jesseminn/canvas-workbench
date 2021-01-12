import { CreateHook } from './types';

type UseMousePosition = (position: Position) => Position;
type Position = { x: number; y: number };

export const useMousePosition: CreateHook<UseMousePosition> = hook => initialPosition => {
    const [position, setPosition] = hook.useState(initialPosition);
    hook.useEffect(() => {
        const onMouseMove = (e: MouseEvent) => {
            const x = e.clientX;
            const y = e.clientY;
            setPosition({ x, y });
        };

        window.addEventListener('mousemove', onMouseMove);
        return () => {
            window.removeEventListener('mousemove', onMouseMove);
        };
    }, []);

    return position;
};
