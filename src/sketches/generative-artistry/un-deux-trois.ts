import { Canvas, CanvasElement } from '~canvas';

const canvas = new Canvas({
    width: 500,
    height: 500,
});

const el = new CanvasElement({
    draw: (ctx, { hook }) => {
        const canvas = ctx.canvas;

        ctx.lineWidth = 4;
        ctx.lineCap = 'round';

        const size = canvas.height;
        const step = 20;
        const aThirdOfHeight = canvas.height / 3;

        const draw = hook.callback((x: number, y: number, width: number, height: number, positions: number[]) => {
            ctx.save();
            ctx.translate(x + width / 2, y + height / 2);
            ctx.rotate(Math.random() * 5);
            ctx.translate(-width / 2, -height / 2);

            positions.forEach(position => {
                ctx.beginPath();
                ctx.moveTo(position * width, 0);
                ctx.lineTo(position * width, height);
                ctx.stroke();
            });

            ctx.restore();
        });

        for (var y = step; y < size - step; y += step) {
            for (var x = step; x < size - step; x += step) {
                if (y < aThirdOfHeight) {
                    draw(x, y, step, step, [0.5]);
                } else if (y < aThirdOfHeight * 2) {
                    draw(x, y, step, step, [0.2, 0.8]);
                } else {
                    draw(x, y, step, step, [0.1, 0.5, 0.9]);
                }
            }
        }
    },
});

canvas.addElement(el);

export default canvas;
