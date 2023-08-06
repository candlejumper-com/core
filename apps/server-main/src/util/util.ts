export function randomNumberBetween(min: number, max: number) {
    return Math.random() * (max - min + 1) + min
}

export function countDecimals(value: number) {
    if ((value % 1) != 0)
        return value.toString().split(".")[1].length;
    return 0;
}

export function sleep(milliseconds: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
}