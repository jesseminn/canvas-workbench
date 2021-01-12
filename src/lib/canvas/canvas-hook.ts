import { Maybe, ActionReducer, Dispatch, NullaryCallback, NullaryFunction } from '~lib/types';
import { EventEmitter } from '~utils/class.utils';
import { compareArray } from '~utils/array.utils';

type SetState<S> = {
    (newState: S): void;
    (updater: Updater<S>): void;
};

type Updater<State> = (currentState: State) => State;

type EffectRegistry<D extends any[]> = {
    effect: Effect;
    deps: D;
    cleanup: Maybe<NullaryCallback>;
};

type Effect = NullaryFunction<Maybe<NullaryCallback>>;

export class CanvasHook {
    private registry = new Map<number, any>();
    private registryIndex = 0;
    private stateUpdated = new EventEmitter();

    private incrementRegistryIndex() {
        this.registryIndex += 1;
        return this.registryIndex;
    }

    private resetRegistryIndex() {
        this.registryIndex = 0;
    }

    subscribeToStateUpdated(callback: NullaryCallback) {
        this.stateUpdated.subscribe(callback);
    }

    // Hooks

    useState<S>(initialState: S): readonly [S, SetState<S>] {
        const index = this.incrementRegistryIndex();
        let state: S;
        if (this.registry.has(index)) {
            state = this.registry.get(index);
        } else {
            state = initialState;
            this.registry.set(index, initialState);
        }

        const setState: SetState<S> = (arg: any) => {
            if (typeof arg === 'function') {
                const updater: Updater<S> = arg;
                const currentState = this.registry.get(index);
                const newState = updater(currentState);
                this.registry.set(index, newState);
            } else {
                const newState: S = arg;
                this.registry.set(index, newState);
            }
            this.stateUpdated.emit();
            this.resetRegistryIndex();
        };

        return [state, setState] as const;
    }

    useReducer<S, A, P>(reducer: ActionReducer<S, A, P>, initialState: S) {
        const [state, setState] = this.useState(initialState);

        const dispatch: Dispatch<A> = action => {
            const nextState = reducer(state, action);
            setState(nextState);
        };

        return [state, dispatch] as const;
    }

    useEffect<D extends any[]>(effect: Effect, deps: D) {
        const index = this.incrementRegistryIndex();
        const registeredValue: EffectRegistry<D> = this.registry.get(index);

        if (!registeredValue) {
            // first run
            const cleanup = effect();
            this.registry.set(index, { effect, deps, cleanup });
        } else {
            const { deps: registeredDeps, cleanup: registeredCleanup } = registeredValue;
            const isDepsChanged = !compareArray(deps, registeredDeps);

            if (isDepsChanged) {
                // 1. run cleanup
                typeof registeredCleanup === 'function' && registeredCleanup();
                // 2. run callback and save cleanup
                const cleanup = effect();
                // 3. update registry
                this.registry.set(index, { effect, deps, cleanup });
            }
        }
    }

    useCallback<T extends Function, U extends any[]>(callback: T, deps: U) {
        const index = this.incrementRegistryIndex();
        const registeredValue: { callback: T; deps: U } = this.registry.get(index);
        if (!registeredValue) {
            this.registry.set(index, { callback, deps });
            return callback;
        } else {
            const { callback: registeredCallback, deps: registeredDeps } = registeredValue;
            const isDepsChanged = !compareArray(deps, registeredDeps);
            if (isDepsChanged) {
                this.registry.set(index, { callback, deps });
                return callback;
            } else {
                return registeredCallback;
            }
        }
    }

    useMemo<R>(callback: NullaryFunction<R>) {
        const index = this.incrementRegistryIndex();
        if (this.registry.has(index)) {
            return this.registry.get(index);
        } else {
            const result = callback();
            this.registry.set(index, result);
            return result;
        }
    }
}
