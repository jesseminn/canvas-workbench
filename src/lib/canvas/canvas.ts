import { Maybe } from '~lib/types';
import { CanvasElement } from '~canvas';

export type CanvasOptions = {
    width?: number;
    height?: number;
    elements?: CanvasElement[];
    clearCanvas?: boolean;
};

export class Canvas {
    private ctx: Maybe<CanvasRenderingContext2D>;
    private canvasWidth = 0;
    private canvasHeight = 0;
    private readonly DPR = window.devicePixelRatio;
    private readonly elements: CanvasElement[] = [];

    constructor(options: CanvasOptions = {}) {
        this.initCanvas(options);
    }

    private initCanvas(options: CanvasOptions) {
        const { width = window.innerWidth, height = window.innerHeight, elements } = options;

        if (Array.isArray(elements)) {
            this.addElement(...elements);
        }

        const canvasElement = document.createElement('canvas');
        this.ctx = canvasElement.getContext('2d');
        this.canvasWidth = width * this.DPR;
        this.canvasHeight = height * this.DPR;
        canvasElement.width = this.canvasWidth;
        canvasElement.height = this.canvasHeight;
        canvasElement.style.display = 'block';
        canvasElement.style.width = `${width}px`;
        canvasElement.style.height = `${height}px`;
        canvasElement.style.margin = '0';
        document.body.style.margin = '0';
        document.body.append(canvasElement);

        // NOTICE: has to be AFTER assigning width or height to canvas element
        // because which will reset the scale!
        // Ref: https://stackoverflow.com/a/49094226
        if (this.ctx) {
            this.ctx.scale(this.DPR, this.DPR);
        }
    }

    render() {
        if (!Array.isArray(this.elements)) return;

        this.elements.forEach(element => {
            if (!this.ctx) return;
            element.render(this.ctx);
        });
    }
    addElement(...elements: CanvasElement[]) {
        this.elements.push(...elements);
    }
}
