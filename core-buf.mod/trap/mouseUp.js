function mouseUp(e) {
    if (e.ctrlKey) {
        const cell = lab.port.pick(e.x, e.y, [])
        if (cell) console.dir(cell)
        return
    }
    
    if (e.button === 0) {
        // LMB
        lab.port.poke(e.x, e.y)
    } else if (e.button === 2) {
        // RMB
        _.core.sweep()
    }
}
