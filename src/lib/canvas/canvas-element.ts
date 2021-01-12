import { Maybe } from '~lib/types';
import { CanvasHook } from './canvas-hook';

export type CanvasElementWorkbench = {
    hook: CanvasHook;
};

export type CanvasElementOptions = {
    draw: Draw;
};

export type Draw = (ctx: CanvasRenderingContext2D, workbench: CanvasElementWorkbench) => void;

export class CanvasElement {
    private readonly hook = new CanvasHook();
    private draw: Maybe<Draw> = null;
    private ctx: Maybe<CanvasRenderingContext2D> = null;

    constructor(options: CanvasElementOptions) {
        const { draw } = options;
        this.draw = draw;
        // TODO: need unsubscribe
        this.hook.subscribeToStateUpdated(() => {
            if (this.ctx) {
                this.render(this.ctx);
            }
        });
    }

    render(ctx: CanvasRenderingContext2D) {
        this.ctx = ctx;

        if (typeof this.draw === 'function') {
            this.draw(ctx, {
                hook: this.hook,
            });
        }
    }
}
