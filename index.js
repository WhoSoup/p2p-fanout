const Sim = require('./sim.js')

const samples = 10000
const count = 150
const connections = 16
const fanout = 5
const rounds = 4

let s = new Sim(count, connections, fanout, rounds)
for (let i = 0; i < samples; i++) {
    if (i % 1000 == 0 && i != 0) {
        s.randomizeConnections()
    }
    s.sample()
    if (i % 1000 == 0) {
        console.log(`${i}`)
    }
}

let reach = 0.00
let reachbest = 0.00
let reachworst = 1.00
let wasted = 0.00
let wastedbest = 0.00
let wastedworst = 1.00
for (let i of s.data) {
   let r = (i.sent+1) / count
   reach += r
   reachbest = r > reachbest ? r : reachbest
   reachworst = r < reachworst ? r : reachworst
   
   let w = i.waste / (i.waste + i.sent)
   wasted += w
   wastedbest = r > wastedbest ? r : wastedbest
   wastedworst = r < wastedworst ? r : wastedworst
}
let reacht = Math.round(reach / samples * 100, 2)
let wastedt = Math.round(wasted / samples * 100, 2)

console.log(`Reach: ${reacht}%, Wasted: ${wastedt}%`)
console.log(`    r: ${reachbest} ${reachworst}`)
console.log(`    w: ${wastedbest} ${wastedworst}`)
