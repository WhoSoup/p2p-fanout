# Gossip Network Simulator

This is a very, very, very customized Node.js script that I'm publishing for my blog. It is not very well documented and is likely very inefficient. It does the job I want it to.

If there is a demand for a (more user friendly) simulator with better output and more analysis, please let me know.

## Data

The output produced can be seen [in the wiki](https://github.com/WhoSoup/p2p-fanout/wiki), with a more descriptive explanation in my blog.

## Running

You can run it with `node .` inside the directory. It takes a very long time to take a lot of samples. It prints tables in Markdown format to StdOut and status updates to StdErr. I suggest piping the StdOut to a file as it likely won't fit into a console window.

## Modifying

To change the node count being simulated, look at the bottom of `index.js`. 

To enable history tracking, edit `sim.js` and uncomment the four lines with `.history` in them. 