import { UnaryCallback } from '~lib/types';

export class EventEmitter<T = void> {
    private readonly callbacks = new Set<UnaryCallback<T>>();

    emit(payload: T) {
        this.callbacks.forEach(callback => {
            if (typeof callback === 'function') {
                callback(payload);
            }
        });
    }

    subscribe(callback: UnaryCallback<T>) {
        this.callbacks.add(callback);
        const unsubscribe = () => {
            this.callbacks.delete(callback);
        };
        return unsubscribe;
    }

    subscribeOnce(callback: UnaryCallback<T>) {
        const unsubscribe = this.subscribe((...args: Parameters<typeof callback>) => {
            callback(...args);
            unsubscribe();
        });
    }
}

export type DebuggerOptions = {
    label: string;
    enabled?: boolean;
};

export class Debugger {
    private readonly DEBUG: boolean;
    private readonly LABEL: string;

    constructor(options: DebuggerOptions) {
        const { label, enabled = false } = options;
        this.LABEL = `[${label}]`;
        this.DEBUG = enabled;
    }

    /** Always prints message */
    public log(message: string = '', ...args: any[]) {
        console.log(`${this.LABEL} ${message}`);
        console.log(...args);
        console.log('----------');
    }

    /** Only prints when DEBUG is true */
    public debug(message: string = '', ...args: any[]) {
        if (!this.DEBUG) return;
        this.log(message, ...args);
    }
}
