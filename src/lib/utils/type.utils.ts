export const isObject = (v: unknown): v is object => {
    return Object.prototype.toString.call(v) === '[object Object]';
};

/**
 * Ref: https://dev.to/functional_js/null-vs-undefined-answer-nil-31mj
 */
export const isNil = (v: unknown): v is null | undefined => {
    return v === null || v === undefined;
};
