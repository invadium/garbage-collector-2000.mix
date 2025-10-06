class Signal {

    constructor(st) {
        const id = ++ids.signal
        augment(this, {
            name: 'signal' + id,
            id:    id,
            pid:   0,
            ttl:   11, // time to live in motions
            ttw:   5,  // minimal steps to walk before an action

            stat: {
                motions: 0,
                steps:   0,
                repeats: 0,
                stalls:  0,
            },
            lastMotion: $.env.time,

            dead:  false,
        }, st)
    }

    // allocate and link target cell and autokill
    allocate(cell, fallback) {
        if (!cell || !cell.isAllocatable()) {
            // log("can't allocated - fallback")
            return fallback()
        }

        cell.allocate(this.pid)
        this.__.establishLink(this, this.cell, cell)
        this.kill()

        return true
    }

    connectTo(targetCell, fallback) {
        if (!targetCell) return fallback()

        const link = this.__.establishLink(this, this.cell, targetCell)
        this.kill()
        // log(`new link: ${link.toString()}`)

        return true
    }

    release(link, fallback) {
        if (!link) return fallback()

        link.kill()
        this.kill()

        return true
    }

    // release and free target cell and autokill
    free(fallback) {
        if (!this.cell || !this.cell.isFreeable()) {
            // log("can't free current cell - fallback")
            return fallback()
        }

        this.cell.free()
        this.kill()

        return true
    }

    moveTo(target) {
        if (!target || target.isSignaling()) return false

        const accepted = target.acceptSignal(this)
        if (!accepted) return false

        this.stat.moves ++
        return true
    }

    // leap from the link to the next cell
    leapToNextCell() {
        // log(`[${this.toString()}] leaping to next cell`)
        if (!this.targetCell) return false

        const moved = this.moveTo(this.targetCell)
        if (moved) {
            this.targetCell = null
            this.originCell = null
            return true
        } else {
            return false
        }
    }

    setHolder(holder) {
        if (this.holder) this.holder.releaseSignal()
        this.holder = holder
        if (holder instanceof dna.Cell) {
            this.cell = holder
            this.link = null
        } else if (holder instanceof dna.Link) {
            this.link = holder
            this.cell = null
        }
        holder._smellId = this.id
    }

    // next signal motion - move, link, allocate, release, free
    motion() {
        this.stat.motions ++
        this.lastMotion = $.env.time
        // ttl kill switch
        if (this.ttl) {
            this.ttl--
            if (this.ttl === 0) {
                // log(`[${this.toString()}] ttl killswitch`)
                return this.kill()
            }
        }
        // TODO autokill signals that can't move and can't realize their purpose
        // ...

        if (this.link) return this.leapToNextCell()

        const signal = this
        function followNextLink() {
            // try to follow the links nobody visited yet
            let link = math.rnde(signal.cell.rawLinks())
            // if none, try to follow the link we haven't visited recently
            if (!link) {
                // log(`[${signal.toString()}] no raw links - picking fresh`)
                link = math.rnde(signal.cell.freshLinks(signal.id))
            } else {
                // log(`[${signal.toString()}] got a raw link`)
                // console.dir(signal.cell.rawLinks())
            }
            // if none, just pick a random one
            if (!link) {
                // log(`[${signal.toString()}] no fresh links - picking a random link `)
                link = math.rnde(signal.cell.links)
            }

            if (link) {
                // log(`[${signal.toString()}] got a link [${link.name}]`)
                signal.originCell = link.getLocal(signal.cell)
                signal.targetCell = link.getRemote(signal.cell)
                if (!signal.originCell || !signal.targetCell) return false

                return signal.moveTo(link)
            }
            return false
        }

        if (this.ttw > 0) {
            // still have obligatory moves
            // log(`[${this.toString()}] still walking - ttw:${this.ttw}`)
            this.ttw --
            return followNextLink()
        } 

        const neighbours = this.__.classifyNeighbours( this.cell.x, this.cell.y, this.pid )

        if (this.type === dry.ALLOC) {
            const separatedCell = math.rnde(neighbours.separated)
            if (separatedCell) {
                // got a friendly cell to connect to
                return this.connectTo(separatedCell, followNextLink)
            }

            // log(`[${this.toString()}] trying to allocate`)
            const freeCell = math.rnde(neighbours.free)

            if (freeCell) {
                // log(`[${this.toString()}] selectd the cell: ` + freeCell.toString())
            } else {
                // log(`[${this.toString()}] no cell to allocate`)
            }

            if (freeCell) return this.allocate(freeCell, followNextLink)
            else return followNextLink()

        } else if (this.type === dry.RELEASE) {

            const link = math.rnde(this.cell.links)
            if (link) {
                return this.release(link, followNextLink)
            } else {
                return followNextLink()
            }


        } else if (this.type === dry.FREE) {
            return this.free(followNextLink)
            /*
            const allocatedCell = math.rnde(neighbours.allocated)
            if (allocatedCell) {
                return this.free(allocatedCell, followNextLink)
            } else {
                return followNextLink()
            }
            */

        } else {
            return false
        }
    }

    evo(dt) {
        if ($.env.time - this.lastMotion > env.tune.signal.propagationSpeed) {
            const motion = this.motion()
            if (!motion) {
                this.stat.stalls ++
                if (this.stat.stalls > env.tune.signal.stallKillSwitch) {
                    // log(`[${this.toString()}] stalled - activating kill switch`)
                    this.kill()
                }
            }
        }

        // evolutionary kill switches
        if (this.cell && this.cell.isFree()) this.kill()
        if (this.link && this.link.dead) this.kill()
    }

    toString() {
        let coord = ''
        if (this.cell) {
            coord = `@${this.cell.x}:${this.cell.y}`
        } else if (this.link) {
            const o = this.link.origin,
                  d = this.link.dest
            coord = `@${o.x}:${o.y}--${d.x}:${d.y}`
        }
        return `[${this.name}${coord}|${this.ttl}/${this.ttw}]`
    }

    kill() {
        if (this.dead) return false

        this.dead = true
        if (this.holder) this.holder.releaseSignal()
        this.cell   = null
        this.link   = null
        this.holder = null

        return true
    }

}
