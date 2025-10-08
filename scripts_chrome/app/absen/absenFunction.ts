export function detectWorkingAndOverHours(date: Date, departemenId: number, workingHours: number, checkIn: string, checkOut: string) {
            let restHour = 1;

            const isFriday = date.getDay() == 5;
            const isSaturday = date.getDay() == 6;
            const isOutsourceLabor = departemenId != 392;
            const isWorkingHours5 = workingHours <= 6;
            const isMorningWorker = Number(checkIn.substring(0, 2)) < 12;
            // if friday and its outsourcing
            if(isFriday && isOutsourceLabor && isMorningWorker) restHour = 1.5;
            if(isWorkingHours5) restHour = 0;
            
            // std hour another than 392 departemen id
            let setStdHour = 7;
            let overTime = 0;
            // ==================== set std hour for all labor
                const riilJamIn = Number(checkIn.substring(0, 2));
                const riilJamOut = Number(checkOut.substring(0, 2));
                const riilMenitIn = Number(checkIn.substring(3, 5));
                let jamIn = riilJamIn;
                let jamOut = riilJamOut;
                // Jam masuk, if menit != 00 ? jam + 1 : jam tetap samain
                if(riilMenitIn != 0) jamIn = riilJamIn + 1;
                // if jam in > out ? jam out + 24
                if(jamIn > riilJamOut) jamOut = riilJamOut + 24;
                // jam out - jam in
                setStdHour = jamOut - jamIn;
                if(setStdHour > 5) {
                    if(restHour == 0) restHour = 1;
                    setStdHour = jamOut - jamIn - restHour
                }
            // ==================== end of set std hour for all labor
            if(!isOutsourceLabor) {
                if(isSaturday) {
                    if(setStdHour > 6) overTime = setStdHour - 5;
                    setStdHour = 5;
                } else {
                    overTime = setStdHour - 7;
                    setStdHour = 7;
                }
            }

            return {
                stdHour: setStdHour,
                restHour,
                overTime,
                workingHours
            }
    }

    // ===================================================== TESTING ========================================================


// const test = [
//     {
//         test: detectWorkingAndOverHours(new Date("2025-09-06"), 392, 6, "06:58", "12:53"),
//         result: {
//                 stdHour: 5,
//                 restHour: 0,
//                 overTime: 0,
//                 workingHours: 6
//             }
//     },
//     {
//         test: detectWorkingAndOverHours(new Date("2025-09-06"), 392, 7, "06:58", "15:53"),
//         result: {
//                 stdHour: 5,
//                 restHour: 1,
//                 overTime: 2,
//                 workingHours: 7
//             }
//     },
//     {
//         test: detectWorkingAndOverHours(new Date("2025-09-04"), 392, 7, "07:58", "17:53"),
//         result: {
//                 stdHour: 7,
//                 restHour: 1,
//                 overTime: 1,
//                 workingHours: 7
//             }
//     },
//     {
//         test: detectWorkingAndOverHours(new Date("2025-09-04"), 492, 7, "07:58", "18:53"),
//         result: {
//                 stdHour: 9,
//                 restHour: 1,
//                 overTime: 0,
//                 workingHours: 7
//             }
//     },
//     {
//         test: detectWorkingAndOverHours(new Date("2025-09-05"), 492, 7, "07:58", "18:53"),
//         result: {
//                 stdHour: 8.5,
//                 restHour: 1.5,
//                 overTime: 0,
//                 workingHours: 7
//             }
//     },
//     {
//         test: detectWorkingAndOverHours(new Date("2025-09-05"), 492, 7, "14:58", "03:23"),
//         result: {
//                 stdHour: 11,
//                 restHour: 1,
//                 overTime: 0,
//                 workingHours: 7
//             }
//     },
//     {
//         test: detectWorkingAndOverHours(new Date("2025-09-06"), 492, 7, "07:58", "14:23"),
//         result: {
//                 stdHour: 5,
//                 restHour: 1,
//                 overTime: 0,
//                 workingHours: 7
//             }
//     },
//     {
//         test: detectWorkingAndOverHours(new Date("2025-09-06"), 492, 7, "08:00", "18:23"),
//         result: {
//                 stdHour: 9,
//                 restHour: 1,
//                 overTime: 0,
//                 workingHours: 7
//             }
//     },
// ];

// let index = 1;
// for(let t  of test) {
//     const overTime = t.test.overTime === t.result.overTime
//     const restHour = t.test.restHour === t.result.restHour
//     const stdHour = t.test.stdHour === t.result.stdHour

//     if(!overTime || !restHour || !stdHour) {

//         console.error(`${index} overtime=${overTime} ${t.result.overTime} restHour=${restHour} stdHour=${stdHour}` ) 
//     }
//     index++
// }