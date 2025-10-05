class Signal {

    constructor(st) {
        augment(this, {
            name: 'signal' + (++id.signal),
            ttl:   11,

            lastMove: $.env.time,
        }, st)
    }

    allocate(cell) {
        if (!cell || cell.v !== 0 || cell.locked) return false

        this.__.allocate(cell)
        this.kill()

        return true
    }

    free(cell) {
        if (!cell || cell.v === 0 || cell.locked) return false

        this.__.free(cell)
        this.kill()

        return true
    }

    move() {
        const neighbours = this.__.classifyNeighbours( this.cell.x, this.cell.y )

        const signal = this
        function moveNext() {
            const next = math.rnde(neighbours.allocated)

            // TODO resolve signal collisions
            if (!next || next.signal) return

            next.signal = signal
            signal.cell.signal = null
            signal.cell = next
        }

        if (this.type === dry.ALLOC) {
            const freeCell = math.rnde(neighbours.free)
            if (freeCell) {
                if (!this.allocate(freeCell)) moveNext()
            } else {
                moveNext()
            }

        } else {
            if (this.ttl > 5) {
                moveNext()
            } else {
                const allocCell = math.rnde(neighbours.allocated)
                if (allocCell) {
                    if (!this.free(allocCell)) moveNext()
                } else {
                    moveNext()
                }
            }
        }

        this.ttl--
        if (this.ttl === 0) this.kill()
        
        // TODO autokill signals that can't move and can't realize their purpose

        this.lastMove = $.env.time
    }

    evo(dt) {
        if ($.env.time - this.lastMove > env.tune.signalPropagationSpeed) {
            this.move()
        }
    }

    draw() {
    }

    kill() {
        this.dead = true
        this.cell.signal = null
    }
}
