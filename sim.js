// a message
class Msg {
    constructor(id, r, f) {
        this.id = id
        this.round = r
        this.from = f
        //this.history = []
    }
    // generate message for next round 
    next() {
        let n = new Msg(this.id, this.round+1, this.from)
        //n.history = this.history
        return n
    }
}

// a node
class Node {
    constructor(id, cons) {
        this.id = id
        this.recv = [] // message id => count
        this.sent = [] // message id => int-bool
        this.cons = cons
        this.msg = null
    }
    initRound() {
        this.msg = null
        this.recv.push(0)
        this.sent.push(0)
    }
    receive(m) {
        this.recv[m.id]++
        if (this.msg == null) {
            this.msg = m.next()
            //this.msg.history.push(this.id)
            return true
        }
        return false
    }
    
    // perform one round
    round(nodes, rnd, fanout) {
        let r = {sent: 0, waste: 0}
        if (this.msg == null) {
            return r
        }
        if (this.sent[this.msg.id] > 0) {
            return r
        }
        
        if (this.msg.round != rnd) {
            return r
        }
        
        // fanout
        let fo = without(this.cons, [])
        shuffle(fo)
        fo = fo.slice(0, fanout)
        //fo = without(fo, this.msg.history)
        
        this.sent[this.msg.id] = 1
        this.msg.from = this.id
        
        
        //console.log(`sending ${this.msg.id} from #${this.id} to ${fo}`)
        for (let i of fo) {
            if (nodes[i].receive(this.msg)) {
                r.sent++
            } else {
                r.waste++
            }
        }
        
        return r
    }
}

// shuffle array
function shuffle(a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
}

// subtract array "wo" from "a"
function without(a, wo) {
    let r = []
    for (let i of a)
        if (wo.indexOf(i) == -1)
            r.push(i)
    return r
}

// a simulator
class Sim {
    constructor(count, connections, fanout, rounds) {
        this.count = count
        this.connections = connections
        this.fanout = fanout
        this.rounds = rounds
        this.nodes = this.makeNetwork()
        this.randomizeConnections()
        this.samples = 0
        this.data = []
    }
    
    makeNetwork() {
        let nodes = []
        for (let i = 0; i < this.count; i++) {
            nodes.push(new Node(i, []))
        }
        return nodes
    }

    // create bi-directional random nodes
    randomizeConnections() {
        for (let n of this.nodes) {
            n.cons = []
        }
        let ll = [...Array(this.count).keys()]
        for (let i = 0; i < this.count; i++) {
            let needed = this.connections - this.nodes[i].cons.length;
            if (needed > 0) {
                let links = without(ll, [i, ...this.nodes[i].cons])
                shuffle(links)
                links = links.slice(0, needed)
                //console.log(`Node ${i} needs ${needed} cons, have ${this.nodes[i].cons}, picking ${links}`)
                for (let c of links) {
                    this.nodes[i].cons.push(c)
                    this.nodes[c].cons.push(i)
                }
            }
        }
    }
    
    // initialize nodes with connections to the first 10 nodes, fill the rest randomly
    hubConnections() {
        for (let n of this.nodes) {
            for (let i = 0; i < 10; i++) {
                if (i != n.id) {
                    n.cons.push(i)
                    this.nodes[i].cons.push(n.id)
                }
            }
        }
        let ll = [...Array(this.count).keys()]
        for (let i = 0; i < this.count; i++) {
            let needed = this.connections - this.nodes[i].cons.length;
            if (needed > 0) {
                let links = without(ll, [i, ...this.nodes[i].cons])
                shuffle(links)
                links = links.slice(0, needed)
                //console.log(`Node ${i} needs ${needed} cons, have ${this.nodes[i].cons}, picking ${links}`)
                for (let c of links) {
                    this.nodes[i].cons.push(c)
                    this.nodes[c].cons.push(i)
                }
            }
        }
    }
    
    // generate samples
    sample() {
        for (let n of this.nodes) {
            n.initRound()
        }
        this.nodes[0].recv[this.samples]++
        this.nodes[0].msg = new Msg(this.samples, 0, 0)
        
        
        let i = 0
        let total = {sent: 0, waste: 0, overload: 0, rounds: 0}
        do {
            //console.log(`round ${i} start`)
            for (let n of this.nodes) {
                let r = n.round(this.nodes, i, this.fanout)
                total.sent += r.sent
                total.waste += r.waste
            }
            total.rounds++
            i++
        } while (i < this.rounds)
            
        for (let n of this.nodes) {
            total.overload += n.recv[this.samples]
        }
        
        this.data.push(total)
        
        this.samples++

        /*for (let n of this.nodes) {
            console.log(n.id, n.recv.slice(0,3))
        }*/
        
    }
}

module.exports = Sim