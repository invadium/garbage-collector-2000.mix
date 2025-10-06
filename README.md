# Garbage Collector 2000

You are an advanced garbage collector of a mainframe of unnamed corporation.

Free memory by collecting garbage with mark-and-sweep algorithm.


## How to Debug

Available flags:

```
--probeCore             - show core framebuffer raw snapshot
--probeAlloc            - allocate free memory cell on double click
--probeCells            - dump the cell object on ctrl + click
--probePid              - show cell process ids
--probeResUtil          - show resource utilization for each terminal
--traceCells            - accumulate individual event logs for cells
--traceMotion           - log every single movement by the signal
--enableCosmicRays <FQ> - randomly flip memory cells with specified frequency (1 by default)
```

## AFK

To set the AFK label, set the ```--afk``` parameter:

```
jam -d --afk 'Coffee Break'
```
