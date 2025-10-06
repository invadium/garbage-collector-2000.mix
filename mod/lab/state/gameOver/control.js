function onActivate() {
    this.startedAt = env.time
    lab.background = env.color.background
}

function onDeactivate() {}

function next() {
    if (!this.startedAt) return

    this.startedAt = 0
    lab.control.state.transitTo('menu')
}

function evo(dt) {
    if (this.startedAt && env.time > this.startedAt + env.tune.gameOver.hold) {
        this.next()
    }
}
