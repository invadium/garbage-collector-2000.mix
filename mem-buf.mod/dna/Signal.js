class Signal {

    constructor(st) {
        augment(this, {
            name: 'signal' + (++ids.signal),
            pid:   0,
            ttl:   11,

            lastMove: $.env.time,

            dead:  false,
        }, st)
    }

    allocate(cell) {
        if (!cell || !cell.isAllocatable()) return false

        cell.allocate(this.pid)
        this.__.establishLink(this, this.cell, cell)
        this.kill()

        return true
    }

    free(cell) {
        if (!cell || !cell.isFreeable()) return false

        cell.free()
        this.kill()

        return true
    }

    move() {
        const neighbours = this.__.classifyNeighbours( this.cell.x, this.cell.y, this.pid )

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

        if (this.cell && this.cell.isFree()) this.kill()
    }

    draw() {
    }

    kill() {
        this.dead = true
        this.cell.signal = null
    }
}
