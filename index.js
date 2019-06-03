const Sim = require('./sim.js')

function add(ex, avg) {
    ex.avg += avg
    ex.min = avg < ex.min ? avg : ex.min
    ex.max = avg > ex.max ? avg : ex.max
    return ex
}
function stats(s, count, sample) {
    s.reach = add(s.reach, (sample.sent + 1) / count)
    s.waste = add(s.waste, sample.waste / (sample.waste + sample.sent))
    s.overload = add(s.overload, sample.overload / count)
    return s
}

function sample(samples, count, connections, fanout, rounds) {
    let s = new Sim(count, connections, fanout, rounds)
    for (let i = 0; i < samples; i++) {
        if (i % 1000 == 0) {
            s.randomizeConnections()
            //s.hubConnections()
            //console.log(`${i}`)
        }
        s.sample()

    }

    let stat = {
        reach: {avg: 0.0, min: 1.0, max: 0.0},
        waste: {avg: 0.0, min: 1.0, max: 0.0},
        overload: {avg: 0.0, min: 2147483647, max: 0.0},
    }
    
    for (let i of s.data) {
        stat = stats(stat, count, i)
    }
    
    let reacht = Math.round(stat.reach.avg / samples * 100, 2)
    let wastedt = Math.round(stat.waste.avg / samples * 100, 2)
    let overloadt = Math.round(stat.overload.avg / samples, 2)
    

    /*
    console.log(`Samples: ${samples}, Nodes: ${count}, Cons: ${connections}, Fanout: ${fanout}, Rounds: ${rounds}`)
    console.log(`Reach: ${reacht}%, Wasted: ${wastedt}%, Overload: ${overloadt}`)
    console.log(`    r: ${stat.reach.max} ${stat.reach.min}`)
    console.log(`    w: ${stat.waste.min} ${stat.waste.max}`)
    console.log(`    o: ${stat.overload.min} ${stat.overload.max}`)
    */
    
    process.stdout.write("<nobr>" + reacht + "%/" + wastedt + "%/" + overloadt + "</nobr>|")
        
}

//sample(2000, 150,32,16,6)

/*
console.log("50 nodes")
console.log(`|R / F|1|2|3|4|5|6|`)
console.log(`|---|---|---|---|---|---|---|`)
for (let fanout = 1; fanout <= 16; fanout++) {
    process.stdout.write("|" + fanout + "|")
    for (let rounds = 1; rounds <= 6; rounds++) {
        sample(2000, 50, 32, fanout, rounds)
        
    }
    process.stdout.write("\n")
}
*/
console.log("")
console.log("125 nodes")
console.log(`|R / F|1|2|3|4|5|6|`)
console.log(`|---|---|---|---|---|---|---|`)
for (let fanout = 1; fanout <= 16; fanout++) {
    process.stdout.write("|" + fanout + "|")
    for (let rounds = 1; rounds <= 6; rounds++) {
        sample(2000, 125, 32, fanout, rounds)
        
    }
    process.stdout.write("\n")
}
/*


console.log("")
console.log("200 nodes")
console.log(`|R / F|1|2|3|4|5|6|`)
console.log(`|---|---|---|---|---|---|---|`)
for (let fanout = 1; fanout <= 16; fanout++) {
    process.stdout.write("|" + fanout + "|")
    for (let rounds = 1; rounds <= 6; rounds++) {
        sample(2000, 200, 32, fanout, rounds)
        
    }
    process.stdout.write("\n")
}

console.log("")
console.log("5000 nodes")
console.log(`|R / F|1|2|3|4|5|6|`)
console.log(`|---|---|---|---|---|---|---|`)
for (let fanout = 1; fanout <= 16; fanout++) {
    process.stdout.write("|" + fanout + "|")
    for (let rounds = 1; rounds <= 6; rounds++) {
        sample(1000, 5000, 32, fanout, rounds)
        
    }
    process.stdout.write("\n")
}

*/