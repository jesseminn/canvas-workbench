import { Maybe, MaybeVoid, ActionReducer, Dispatch, NullaryCallback, NullaryFunction } from '~lib/types';
import { EventEmitter, Debugger } from '~utils/class.utils';
import { compareArray } from '~utils/array.utils';
import { debounceIdle } from '~utils/hoc.utils';

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

type Effect = NullaryFunction<MaybeVoid<NullaryCallback>>;

export class CanvasHook {
    private readonly debugger = new Debugger({ label: 'CanvasHook', enabled: false });
    private readonly registry = new Map<number, any>();
    private readonly stateUpdated = new EventEmitter();
    private readonly afterStateUpdated = new EventEmitter();
    private registryIndex = 0;

    private incrementRegistryIndex() {
        this.registryIndex += 1;
        return this.registryIndex;
    }

    private resetRegistryIndex() {
        this.registryIndex = 0;
    }

    private triggerStateUpdated = debounceIdle(() => {
        this.debugger.debug('emitStateUpdated');

        // Trigger callback of stateUpdated (should be render)
        this.stateUpdated.emit();

        // After render, triggers callback of afterStateUpdated (should be effects)
        this.afterStateUpdated.emit();

        // Lastly, reset registry index
        this.resetRegistryIndex();
    });

    private triggerFirstRenderEffect = debounceIdle(() => {
        this.afterStateUpdated.emit();
    });

    subscribeToStateUpdated(callback: NullaryCallback) {
        this.stateUpdated.subscribe(callback);
    }

    // Hooks

    useState<S>(initialState: S): readonly [S, SetState<S>] {
        const index = this.incrementRegistryIndex();
        const isFirstRender = !this.registry.has(index);
        let state: S;

        if (isFirstRender) {
            // first render
            this.debugger.debug('useState: first render');

            state = initialState;
            this.registry.set(index, initialState);

            this.triggerFirstRenderEffect();
        } else {
            state = this.registry.get(index);
        }

        const setState: SetState<S> = (arg: any) => {
            this.debugger.debug('setState', arg);

            const currentState = this.registry.get(index);
            let newState: S;

            if (typeof arg === 'function') {
                const updater: Updater<S> = arg;
                newState = updater(currentState);
            } else {
                newState = arg;
            }

            // Only update state when state is changed
            const isStateChanged = newState !== currentState;
            if (isStateChanged) {
                this.registry.set(index, newState);
                this.triggerStateUpdated();
            }
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

    useRef<T>(initialValue?: T) {
        const [state] = this.useState({ current: initialValue });
        return state;
    }

    useEffect<D extends any[]>(effect: Effect, deps: D) {
        const index = this.incrementRegistryIndex();
        const registeredValue: EffectRegistry<D> = this.registry.get(index);

        this.afterStateUpdated.subscribeOnce(() => {
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
        });
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
