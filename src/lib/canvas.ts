import { Maybe, Callback } from "./types";

export type CanvasOptions = {
	width?: number;
	height?: number;
	elements?: CanvasElement[];
};

export type CanvasPlayOptions = {
	duration?: number;
	frameRate?: number;
};

export class Canvas {
	private ctx: Maybe<CanvasRenderingContext2D>;
	private frameId: Maybe<number>;
	private canvasWidth = 0;
	private canvasHeight = 0;
	private readonly DPR = window.devicePixelRatio;
	private readonly elements: CanvasElement[] = [];

	constructor(options: CanvasOptions = {}) {
		this.initCanvas(options);
	}

	initCanvas(options: CanvasOptions) {
		const {
			width = window.innerWidth,
			height = window.innerHeight,
			elements,
		} = options;

		if (Array.isArray(elements)) {
			this.addElement(...elements);
		}

		const canvasElement = document.createElement("canvas");
		this.ctx = canvasElement.getContext("2d");
		this.canvasWidth = width * this.DPR;
		this.canvasHeight = height * this.DPR;
		if (this.ctx) {
			this.ctx.scale(this.DPR, this.DPR);
		}
		canvasElement.width = this.canvasWidth;
		canvasElement.height = this.canvasHeight;
		canvasElement.style.width = `${width}px`;
		canvasElement.style.height = `${height}px`;
		canvasElement.style.margin = "0";
		document.body.style.margin = "0";
		document.body.append(canvasElement);
	}

	render() {
		if (!Array.isArray(this.elements)) return;
		this.elements.forEach((element) => {
			if (!this.ctx) return;
			element.render(this.ctx);
		});
	}

	play(options?: CanvasPlayOptions) {
		const filledOptions = this.fillPlayOptions(options);

		this.frameId = window.requestAnimationFrame(() => {
			this.clearCanvas();
			this.render();
			this.play();
		});

		if (!options) return;

		if (typeof options.duration === "number") {
			setTimeout(() => {
				this.stop();
			}, options.duration);
		}
	}

	stop() {
		if (typeof this.frameId === "number") {
			window.cancelAnimationFrame(this.frameId);
			this.frameId = null;
		}
	}

	addElement(...elements: CanvasElement[]) {
		this.elements.push(...elements);
	}

	private clearCanvas() {
		if (this.ctx) {
			this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
		}
	}

	private fillPlayOptions(options: Maybe<CanvasPlayOptions>) {
		let filledOptions: CanvasPlayOptions = {};
		if (!options) {
			return filledOptions;
		} else {
			filledOptions = {
				...filledOptions,
				...options,
			};
		}
		return filledOptions;
	}
}

export type CanvasElementOptions<T> = {
	// information will be changed on every render
	draw: Draw<T>;
	state?: T;
};

export type CanvasElementContext<T> = {
	state: Maybe<T>;
	cache: CanvasElementCache;
};

export class CanvasElementCache {
	private cache = new Map<string, any>();

	addCallback(callback: Callback) {
		const key = callback.toString();

		if (this.cache.has(key)) {
			return this.cache.get(key);
		} else {
			this.cache.set(key, callback);
			return callback;
		}
	}

	memoize<R>(callback: Callback<R>) {
		const key = callback.toString();

		if (this.cache.has(key)) {
			return this.cache.get(key);
		} else {
			const result = callback();
			this.cache.set(key, result);
			return result;
		}
	}
}

// export type Draw<T> = (ctx: CanvasRenderingContext2D, state: Maybe<T>) => T;
export type Draw<T> = (
	canvasRenderingContext2D: CanvasRenderingContext2D,
	canvasElementContext: CanvasElementContext<T>,
) => T;

export class CanvasElement<T = any> {
	private state: Maybe<T> = null;
	private cache = new CanvasElementCache();
	private draw: Maybe<Draw<T>> = null;

	constructor(options: CanvasElementOptions<T>) {
		const { state, draw } = options;

		this.state = state;
		this.draw = draw;
	}

	setState(state: T) {
		this.state = state;
	}

	render(ctx: CanvasRenderingContext2D) {
		if (typeof this.draw === "function") {
			const newState = this.draw(ctx, {
				state: this.state,
				cache: this.cache,
			});
			this.setState(newState);
		}
	}
}
