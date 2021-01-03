import { CanvasElementHook } from '~canvas';

export type CreateHook<T> = (use: CanvasElementHook) => T;
