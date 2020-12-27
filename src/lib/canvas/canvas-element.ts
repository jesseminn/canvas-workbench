import { Maybe, Callback } from '../types';

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

    callback<T extends Function>(callback: T) {
        const key = callback.toString();

        if (this.cache.has(key)) {
            return this.cache.get(key) as T;
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
) => Maybe<T>;

export class CanvasElement<T = any> {
    private state: Maybe<T> = null;
    private cache = new CanvasElementCache();
    private draw: Maybe<Draw<T>> = null;

    constructor(options: CanvasElementOptions<T>) {
        const { state, draw } = options;

        this.state = state;
        this.draw = draw;
    }

    setState(state: Maybe<T>) {
        this.state = state;
    }

    render(ctx: CanvasRenderingContext2D) {
        if (typeof this.draw === 'function') {
            const newState = this.draw(ctx, {
                state: this.state,
                cache: this.cache,
            });
            this.setState(newState);
        }
    }
}
