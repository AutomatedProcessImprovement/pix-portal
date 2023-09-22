import { secondsToNearest } from './timeConversions'

const cases = [
    [45759000, "1.45 years"],
    [15780000, "6 months"],
    [8410000, "3.2 months"],
    [2365000, "27.37 days"],
    [1987000, "23 days"],
    [43200, "12 hours"],
    [73800, "20.5 hours"],
    [1080, "18 mins"],
    [630, "10.5 mins"],
    [59, "59 secs"],
    [10, "10 secs"],
    [0, "0 sec"]
];

describe("time conversion", () => {
    test.each(cases)(
        "given %p and %p as arguments, return %p",
        (firstArg, expectedResult) => {
            const result = secondsToNearest(firstArg);
            expect(result).toEqual(expectedResult); 
        }
    )
});