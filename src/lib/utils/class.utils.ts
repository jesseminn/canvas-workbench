import { UnaryCallback } from '~lib/types';

export class EventEmitter<T = void> {
    private subscriptions: UnaryCallback<T>[] = [];
    emit(payload: T) {
        this.subscriptions.forEach(callback => {
            if (typeof callback === 'function') {
                callback(payload);
            }
        });
    }
    subscribe(callback: UnaryCallback<T>) {
        if (typeof callback !== 'function') return;

        const index = this.subscriptions.push(callback) - 1;
        const unsubscribe = () => {
            this.subscriptions.splice(index, 1);
        };
        return unsubscribe;
    }
}
