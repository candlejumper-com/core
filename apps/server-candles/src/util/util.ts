import ProgressBar from "progress"

export function randomNumberBetween(min: number, max: number) {
    return Math.random() * (max - min + 1) + min
}

export function countDecimals(value: number) {
    if ((value % 1) != 0)
        return value.toString().split(".")[1].length;
    return 0;
};

export function showProgressBar(total: number, name: string, applyInterval = false): ProgressBar {
    var bar = new ProgressBar(`${name} [:bar] :percent :etas`, {
        complete: '=',
        incomplete: ' ',
        width: 50,
        total
    });

    if (applyInterval) {
        var timer = setInterval(function () {
            bar.tick();

            if (bar.complete) {
                clearInterval(timer);
            }
        }, 1000);
    }

    return bar
}