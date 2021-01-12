import { VariadicCallback } from '~lib/types';

type Range = [number, number];

export const isInRange = (range: Range, n: number, isInclusive?: boolean) => {
    const [x, y] = range;
    const total = Math.abs(x - y);
    const m = n - Math.min(x, y);

    if (isInclusive) {
        return total >= m && m >= 0;
    } else {
        return total > m && m > 0;
    }
};

export const createGrid = (
    width: number,
    height: number,
    columns: number,
    rows: number,
    callback?: VariadicCallback,
) => {
    const col = width / columns;
    const row = height / rows;

    // The top-left position of every cell
    const grid: [number, number][] = [];

    for (let x = 0; x < width; x += col) {
        for (let y = 0; y < height; y += row) {
            grid.push([x, y]);
            if (typeof callback === 'function') {
                callback(x, y, col, row);
            }
        }
    }
    return { grid, col, row };
};
