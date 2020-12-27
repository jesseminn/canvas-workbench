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
