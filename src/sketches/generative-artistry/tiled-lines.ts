import { Canvas, CanvasElement } from '~canvas';
import { createGrid } from '~utils/number.utils';

// https://generativeartistry.com/tutorials/tiled-lines/

const canvas = new Canvas({
    width: 500,
    height: 500,
});

const el = new CanvasElement({
    draw: (ctx, { hook }) => {
        const size = 500;
        const step = 20;

        ctx.lineCap = 'square';
        ctx.lineWidth = 2;
        const draw = hook.useCallback((x: number, y: number, width: number, height: number) => {
            const isLeftToRight = Math.random() >= 0.5;

            if (isLeftToRight) {
                ctx.moveTo(x, y);
                ctx.lineTo(x + width, y + height);
            } else {
                ctx.moveTo(x + width, y);
                ctx.lineTo(x, y + height);
            }
            ctx.stroke();
        }, []);

        createGrid(size, size, step, step, draw);
    },
});

canvas.addElement(el);

export default canvas;
