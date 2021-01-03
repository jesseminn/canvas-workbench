export const compareArray = (arr1: unknown[], arr2: unknown[]) => {
    return arr1.length === arr2.length && !arr1.some((item, index) => item !== arr2[index]);
};
