export type Maybe<T> = T | null | undefined;

export type NullaryFunction<R> = () => R;

export type NullaryCallback = NullaryFunction<void>;

export type UnaryFunction<T, R> = (arg: T) => R;

export type UnaryCallback<T> = UnaryFunction<T, void>;

export type VariadicFunction<R> = (...args: any[]) => R;

export type VariadicCallback = VariadicFunction<void>;

export type Reducer<T, K> = (acc: T, cur: K) => T;

export type ActionReducer<State, ActionType = any, Payload = any> = Reducer<State, Action<ActionType, Payload>>;

export type Dispatch<ActionType = any, Payload = any> = (action: Action<ActionType, Payload>) => void;

export type Action<ActionType = any, Payload = any> = {
    type: ActionType;
    payload?: Payload;
};
