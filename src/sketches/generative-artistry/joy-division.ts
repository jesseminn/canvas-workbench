import { Canvas, CanvasElement } from '~canvas';
import { createGrid, GridDirection } from '~utils/number.utils';

const VIEWPORT_SIZE = 500;

const canvas = new Canvas({
    width: VIEWPORT_SIZE,
    height: VIEWPORT_SIZE,
});

const sketch = new CanvasElement({
    draw: (ctx, {}) => {
        // segment: length of every step
        const segment = 10;
        // step: the denominator
        const step = VIEWPORT_SIZE / segment;

        createGrid(
            VIEWPORT_SIZE,
            VIEWPORT_SIZE,
            step,
            step,
            (x, y, size, _, index, grid) => {
                const isRowStart = index % step === 0;
                const isRowEnd = index % step === step - 1;
                if (isRowStart) {
                    ctx.beginPath();
                    ctx.moveTo(x, y);
                }
                ctx.lineTo(x + size, y);
                if (isRowEnd) {
                    ctx.stroke();
                }
            },
            ([x, y]) => {
                const random = Math.random() * 10;
                const position: [number, number] = [x, y + random];
                return position;
            },
            GridDirection.ROW,
        );
    },
});

canvas.addElement(sketch);

export default canvas;
