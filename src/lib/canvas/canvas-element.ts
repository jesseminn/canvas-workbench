import { Maybe, Callback } from '~lib/types';
import { compareArray } from '~utils/array.utils';

export type CanvasElementOptions<T> = {
    draw: Draw<T>;
};

export type CanvasElementContext = {
    hook: CanvasElementHook;
};

export class CanvasElementHook {
    private registry = new Map<number, any>();
    private index = 0;

    private register<T>(value: T): [T, number] {
        const index = this.incrementIndex();
        let registeredValue: T;
        if (this.registry.has(index)) {
            registeredValue = this.registry.get(index);
        } else {
            this.registry.set(index, value);
            registeredValue = value;
        }
        return [registeredValue, index];
    }

    private incrementIndex() {
        this.index += 1;
        return this.index;
    }

    resetIndex() {
        this.index = 0;
    }

    state<T>(initialState: T): [T, Callback] {
        const [state, index] = this.register(initialState);
        const setState = <T>(newState: T) => {
            this.registry.set(index, newState);
        };
        return [state, setState];
    }

    effect<T extends Function, U extends any[]>(callback: T, deps: U) {
        const index = this.incrementIndex();
        const registeredValue: { callback: T; deps: U; cleanup: Maybe<Callback> } = this.registry.get(index);
        if (!registeredValue) {
            // first run
            const cleanup = callback();
            this.registry.set(index, { callback, deps, cleanup });
        } else {
            const { deps: registeredDeps, cleanup: registeredCleanup } = registeredValue;
            const isDepsChanged = !compareArray(deps, registeredDeps);
            if (isDepsChanged) {
                // 1. run cleanup
                typeof registeredCleanup === 'function' && registeredCleanup();
                // 2. run callback and save cleanup
                const cleanup = callback();
                // 3. update registry
                this.registry.set(index, { callback, deps, cleanup });
            }
        }
    }

    callback<T extends Function>(callback: T) {
        const [registeredValue] = this.register(callback);
        return registeredValue;
    }

    memo<R>(callback: Callback<R>) {
        const index = this.incrementIndex();
        if (this.registry.has(index)) {
            return this.registry.get(index);
        } else {
            const result = callback();
            this.registry.set(index, result);
            return result;
        }
    }
}

// export type Draw<T> = (ctx: CanvasRenderingContext2D, state: Maybe<T>) => T;
export type Draw<T> = (
    canvasRenderingContext2D: CanvasRenderingContext2D,
    canvasElementContext: CanvasElementContext,
) => void;

export class CanvasElement<T = any> {
    private hook = new CanvasElementHook();
    private draw: Maybe<Draw<T>> = null;

    constructor(options: CanvasElementOptions<T>) {
        const { draw } = options;
        this.draw = draw;
    }

    render(ctx: CanvasRenderingContext2D) {
        if (typeof this.draw === 'function') {
            this.hook.resetIndex();
            this.draw(ctx, {
                hook: this.hook,
            });
        }
    }
}
