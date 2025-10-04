function mouseDown(e) {
    if (e.button === 0) {
        // LMB
        lab.port.poke(e.x, e.y, {
            action: 1,
        })
    } else if (e.button === 2) {
        // RMB
        lab.port.poke(e.x, e.y, {
            action: 0,
        })
    }
}
