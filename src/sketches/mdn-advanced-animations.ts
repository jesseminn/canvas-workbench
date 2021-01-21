import { isInRange } from '~utils/number.utils';
import { Canvas, CanvasElement } from '~canvas';
import { useMousePosition, useInterval } from '~hooks';

// https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Advanced_animations

const canvas = new Canvas({
    width: 600,
    height: 300,
});

const bounce = new CanvasElement({
    draw: (ctx, { hook }) => {
        const canvas = ctx.canvas;
        // TODO: add an interface to get size with dip
        const canvasWidth = canvas.width / window.devicePixelRatio;
        const canvasHeight = canvas.height / window.devicePixelRatio;
        const [vx, setVx] = hook.useState(20);
        const [vy, setVy] = hook.useState(10);
        const [x, setX] = hook.useState(50);
        const [y, setY] = hook.useState(50);

        const drawCircle = hook.useCallback((x: number, y: number) => {
            ctx.beginPath();
            ctx.arc(x, y, 50, 0, Math.PI * 2, true);
            ctx.closePath();
            ctx.fillStyle = 'blue';
            ctx.fill();
        }, []);

        const clearCanvas = hook.useCallback(() => {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        }, [canvasWidth, canvasHeight]);

        useInterval(hook)(() => {
            const newX = x + vx;
            const newY = y + vy;
            const isXInCanvas = isInRange([canvasWidth, 0], newX);
            const isYInCanvas = isInRange([canvasHeight, 0], newY);
            const newVx = isXInCanvas ? vx : -vx;
            const newVy = isYInCanvas ? vy : -vy;
            setX(newX);
            setY(newY);
            setVx(newVx * 0.99);
            setVy(newVy + 1);
        }, 1000 / 60);

        // render
        drawCircle(x, y);
        clearCanvas();
    },
});

const mouseMove = new CanvasElement({
    draw: (ctx, { hook }) => {
        const canvas = ctx.canvas;
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;

        const { x, y } = useMousePosition(hook)({ x: 50, y: 100 });

        const drawCircle = hook.useCallback((cx: number, cy: number) => {
            ctx.beginPath();
            ctx.arc(cx, cy, 50, 0, Math.PI * 2, true);
            ctx.closePath();
            ctx.fillStyle = 'blue';
            ctx.fill();

            ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        }, []);

        drawCircle(x, y);
    },
});

canvas.addElement(mouseMove);

export default canvas;
