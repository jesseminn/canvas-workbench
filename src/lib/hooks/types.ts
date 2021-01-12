import { CanvasHook } from '~canvas';

export type CreateHook<T> = (use: CanvasHook) => T;
