export function convertPointSoRequirePointOnSystem(yourPoint: number|string):number|false {
    const pointAlphabetKuantitatif = {
        B: 100,
        C: 80,
        K: 60
    }

    // Kualitatif point should be, 100, 80 or 60
    if(typeof yourPoint === 'number') {
        if(yourPoint > 80) return 100;
        if(yourPoint > 60) return 80;
        if(yourPoint < 60) return 0;
        return yourPoint
    }

    if(typeof yourPoint === 'string') {
        const isOk = ["B", "C", "K"].includes(yourPoint);
        if(isOk) return pointAlphabetKuantitatif[yourPoint];
    }
    return false
}

const unitTest = [
    {
        test: convertPointSoRequirePointOnSystem(50),
        result: 0
    },
    {
        test: convertPointSoRequirePointOnSystem(60),
        result: 60
    },
    {
        test: convertPointSoRequirePointOnSystem(70),
        result: 80
    },
    {
        test: convertPointSoRequirePointOnSystem(80),
        result: 80
    },
    {
        test: convertPointSoRequirePointOnSystem(69.8),
        result: 80
    },
    {
        test: convertPointSoRequirePointOnSystem(90),
        result: 100
    },
    {
        test: convertPointSoRequirePointOnSystem(100),
        result: 100
    },
    {
        test: convertPointSoRequirePointOnSystem("B"),
        result: 100
    },
    {
        test: convertPointSoRequirePointOnSystem("C"),
        result: 80
    },
    {
        test: convertPointSoRequirePointOnSystem("K"),
        result: 60
    },
    {
        test: convertPointSoRequirePointOnSystem("L"),
        result: false
    },
    {
        test: convertPointSoRequirePointOnSystem(100000),
        result: 100
    },
]

for(let t of unitTest) {
    console.log(t.test === t.result)
}