function mouseUp(e) {
    if (e.button === 0) {
        // LMB
        lab.port.poke(e.x, e.y)
    } else if (e.button === 2) {
        // RMB
        _.core.sweep()
    }
}
