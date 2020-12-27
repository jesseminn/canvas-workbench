export const clearCanvas = (ctx: CanvasRenderingContext2D) => {
    if (!(ctx instanceof CanvasRenderingContext2D)) return;

    const canvas = ctx.canvas;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
};
