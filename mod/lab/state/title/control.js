function onActivate() {
    this.startedAt = env.time
    lab.background = env.color.background
}

function onDeactivate() {}

function next() {
    if (!this.startedAt) return

    this.startedAt = 0
    trap('state/menu')
}

function evo(dt) {
    if (this.startedAt && env.time > this.startedAt + env.tune.title.hold) {
        this.next()
    }
}
