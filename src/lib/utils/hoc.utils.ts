import { VariadicCallback, Maybe } from '~lib/types';

export const debounceAnimationFrame = (callback: VariadicCallback) => {
    let frameId: Maybe<number>;

    return (...args: Parameters<typeof callback>) => {
        if (typeof frameId === 'number') {
            cancelAnimationFrame(frameId);
            frameId = null;
        }
        frameId = requestAnimationFrame(() => {
            if (typeof callback === 'function') {
                callback(...args);
                frameId = null;
            }
        });
    };
};

export const debounceIdle = (callback: VariadicCallback) => {
    let frameId: Maybe<number>;

    return (...args: Parameters<typeof callback>) => {
        if (typeof frameId === 'number') {
            cancelIdleCallback(frameId);
            frameId = null;
        }
        frameId = requestIdleCallback(() => {
            if (typeof callback === 'function') {
                callback(...args);
                frameId = null;
            }
        });
    };
};
