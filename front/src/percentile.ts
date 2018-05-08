export default (array: number[], nth: number) => {
    const percentile = Math.min(100, Math.max(0, nth));

    const sorted = array.sort();
    const index = percentile / 100 * (sorted.length - 1);
    const fraction = index - Math.floor(index);
    const integer = Math.floor(index);

    return array[integer] + (fraction > 0 ? fraction * (array[integer + 1] - array[integer]) : 0);
};
