const Sim = require('./sim.js')

// add a stat vector to total
function add(ex, avg) {
    ex.avg += avg
    ex.min = avg < ex.min ? avg : ex.min
    ex.max = avg > ex.max ? avg : ex.max
    return ex
}

// add another sample to the total
function stats(s, count, sample) {
    s.reach = add(s.reach, (sample.sent + 1) / count)
    s.waste = add(s.waste, sample.waste / (sample.waste + sample.sent))
    s.overload = add(s.overload, sample.overload / count)
    return s
}

// create table cell by taking samples
function sample(samples, count, connections, fanout, rounds, random) {
    let s = new Sim(count, connections, fanout, rounds)
    
    // heavy lifting routine
    for (let i = 0; i < samples; i++) {
        if (i == 0) {
            if (random)
                s.randomizeConnections()
            else
                s.hubConnections()
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
    
    let reacht = (stat.reach.avg / samples * 100).toFixed(1)
    let wastedt = (stat.waste.avg / samples * 100).toFixed(1)
    let overloadt = (stat.overload.avg / samples).toFixed(1)
    

    /*
    console.log(`Samples: ${samples}, Nodes: ${count}, Cons: ${connections}, Fanout: ${fanout}, Rounds: ${rounds}`)
    console.log(`Reach: ${reacht}%, Wasted: ${wastedt}%, Overload: ${overloadt}`)
    console.log(`    r: ${stat.reach.max} ${stat.reach.min}`)
    console.log(`    w: ${stat.waste.min} ${stat.waste.max}`)
    console.log(`    o: ${stat.overload.min} ${stat.overload.max}`)
    */
    
    process.stdout.write(reacht + "%<br>" + wastedt + "%<br>" + overloadt + "|")
}

function table(nodes, samples, random) {
    console.log("")
    console.log("## " + nodes + " nodes @ " + samples + " samples " + (random ? "(random)" : "(hub)"))
    console.log(`|R / F|1|2|3|4|5|6|7|8|`)
    console.log(`|---|---|---|---|---|---|---|---|---|`)
    for (let fanout = 1; fanout <= 16; fanout++) {
        process.stdout.write("|" + fanout + "|")
        for (let rounds = 1; rounds <= 8; rounds++) {
            sample(samples, nodes, 32, fanout, rounds, random)
            
        }
        process.stdout.write("\n")
    }
    console.error(""+nodes+ " " +random+" done")
}

table(50, 100, true)
table(50, 100, false)
table(125, 100, true)
table(125, 100, false)
table(200, 100, true)
table(200, 100, false)
table(1000, 100, true)
table(1000, 100, false)
table(5000, 100, true)
table(5000, 100, false)

//sample(1, 32, 4, 8, 6)