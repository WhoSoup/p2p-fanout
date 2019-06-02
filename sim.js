class Msg {
    constructor(id, r, f) {
        this.id = id
        this.round = r
        this.from = f
    }
    next() {
        return new Msg(this.id, this.round+1, this.from)
    }
}

class Node {
    constructor(id, cons) {
        this.id = id
        this.recv = []
        this.sent = []
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
            return true
        }
        return false
    }
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
        
        let fo = without(this.cons, [this.msg.from])
        shuffle(fo)
        fo = fo.slice(0, fanout)
        
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

function without(a, wo) {
    let r = []
    for (let i of a)
        if (wo.indexOf(i) == -1)
            r.push(i)
    return r
}

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
    
    sample() {
        for (let n of this.nodes) {
            n.initRound()
        }
        this.nodes[0].msg = new Msg(this.samples, 0, 0)
        this.samples++

        let i = 0
        
        let total = {sent: 0, waste: 0, rounds: 0}
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
        this.data.push(total)

        /*for (let n of this.nodes) {
            console.log(n.id, n.recv.slice(0,3))
        }*/
        
    }
}

module.exports = Sim