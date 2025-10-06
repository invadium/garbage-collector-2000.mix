function keyDown(e) {
    if (lab.port.paused) {
        return lab.control.mission.resume()
    }

    switch(e.code) {
        case env.bind.fixed.mark:
        case env.bind.fixed.bomb:
            $.core.sweep()
            break

        case env.bind.fixed.pause:
            lab.control.mission.pause()
            break
    }
}
