class Core {

    constructor(st) {
        augment(this, {
            name:     'core',

            // port space
            x:         0,
            y:         0,
            w:         0,
            h:         0,
            cellSize:  env.tune.core.cellSize,

            // cell space
            cells:     [],
            cw:        16,
            ch:        16,

            links:     [],
            signals:   [],
            terminals: [],
        }, st)
        this.fillMemory()
    }

    fillMemory() {
        const { cw, ch, cellSize } = this
        this.w = cw * cellSize
        this.h = ch * cellSize

        for (let y = 0; y < ch; y++) {
            for (let x = 0; x < cw; x++) {
                const cell = this.cells[y * cw + x] = new dna.Cell({
                    __:  this,
                    x:   x,
                    y:   y,
                })
            }
        }
        this.capacity = this.cells.length
    }

    attachTerminal(term) {
        const targetCell = this.selectFreeEdgeCell()
        if (!targetCell) return false
        if (!targetCell.attachTerminal(term)) return false

        term.__   = this
        this.terminals.push(term)

        return term
    }

    memUsage(pid) {
        if (pid === undefined) pid = -1

        let usage = 0
        for (let i = this.cells.length - 1; i >= 0; i--) {
            const cell = this.cells[i]
            if (cell.val !== 0) {
                if (pid < 0) usage++
                else if (cell.pid === pid) usage++
            }
        }

        return usage
    }

    sigUsage(pid) {
        if (pid === undefined) pid = -1

        let usage = 0
        for (let i = this.signals.length - 1; i >= 0; i--) {
            const signal = this.signals[i]
            if (!signal.dead) {
                if (pid < 0) usage++
                else if (signal.pid === pid) usage++
            }
        }

        return usage
    }

    selectFreeEdgeCell() {
        return math.rnde( this.cells.filter(c => c.edge && c.val === 0 && !c.locked && !c.term) )
    }

    classifyNeighbours(ix, iy, pid) {
        const __ = this
        const res = {
            free:      [],
            allocated: [],
        }
        if (pid === undefined) pid = -1

        function incAt(ix, iy) {
            if (ix < 0 || ix >= __.cw || iy < 0 || iy >= __.ch) return
            const cell = __.cells[iy * __.cw + ix]
            if (cell) {
                if (cell.val === 0) {
                    res.free.push(cell)
                } else {
                    if (pid < 0) res.allocated.push(cell)
                    else if (cell.pid === pid) res.allocated.push(cell)
                }
            }
        }

        incAt(ix    , iy - 1)
        incAt(ix - 1, iy    )
        incAt(ix + 1, iy    )
        incAt(ix    , iy + 1)

        return res
    }

    attachSignal(signal) {
        signal.__ = this
        this.signals.push(signal)

        return signal
    }

    attachLink(link) {
        link.__ = this
        this.links.push(link)

        return link
    }

    establishLink(signal, origin, dest) {

        const link = new dna.Link({
            pid:    signal.pid,
            origin: origin,
            dest:   dest,
        })

        origin.attachLink(link)
        dest.attachLink(link)
        this.attachLink(link)
    }

    // translate parent coordinate to the cell space
    lx(px) {
        return (px - this.x + .5 * this.w) / this.cellSize
    }

    // translate parent coordinate to the cell space
    ly(py) {
        return (py - this.y + .5 * this.h) / this.cellSize
    }

    // translate cell position coordinate center to core space
    cx(lx) {
        return (lx + .5) * this.cellSize
    }

    // translate cell position coordinate center to core space
    cy(ly) {
        return (ly + .5) * this.cellSize
    }

    cellAt(ix, iy) {
        if (ix < 0 || ix >= this.cw || iy < 0 || iy >= this.ch) return
        return this.cells[iy * this.cw + ix]
    }

    sweep() {
        const ls = this.cells
        for (let i = ls.length - 1; i >= 0; i--) {
            const cell = ls[i]
            if (cell.sel > 0) cell.free()
        }
    }

    flip(cell, pid) {
        if (!cell) return false

        if (cell.val === 0) return cell.allocate(pid)
        else return cell.free()
    }

    evo(dt) {
        this.terminals.forEach(t => t.evo(dt))

        for (let i = this.links.length - 1; i >= 0; i--) {
            const link = this.links[i]
            if (link.dead) {
                const at = this.links.indexOf(link)
                this.links.splice(at, 1)
            } else {
                link.evo(dt)
            }
        }

        for (let i = this.signals.length - 1; i >= 0; i--) {
            const signal = this.signals[i]
            if (signal.dead) {
                const at = this.signals.indexOf(signal)
                this.signals.splice(at, 1)
            } else {
                signal.evo(dt)
            }
        }

        if (env.enableCosmicRays) {
            // DEBUG random memory flips due to cosmic rays
            const FQ = isNum(env.enableCosmicRays)? env.enableCosmicRays : 1
            if (math.rndf() < FQ * dt) {
                this.flip( math.rnde(this.cells) )
            }
        }
    }

    draw() {
        const { x, y, w, h, cw, ch, cellSize } = this
        const dw     = env.tune.core.dotRSize * cellSize,
              margin = env.tune.core.cellRMargin * cellSize,
              mw     = cellSize - 2 * margin

        save()
        // core space - the origin is form the core top-left
        translate(x - .5 * w, y - .5 * h)

        // hint the edge
        const lw = 1
        lineWidth(lw)
        stroke( hsl(.6, .6, .5) )
        rect(-lw, -lw, w + 2*lw, h + 2*lw)

        for (let i = this.terminals.length - 1; i >= 0; i--) {
            const term = this.terminals[i]
            if (!term.dead) term.draw()
        }
        for (let i = this.links.length - 1; i >= 0; i--) {
            const link = this.links[i]
            if (!link.dead) link.draw()
        }

        lineWidth(1)
        const color = env.style.color.core
        for (let y = 0; y < ch; y++) {
            for (let x = 0; x < cw; x++) {
                const cell = this.cells[y * cw + x]

                if (cell.val === 0) {
                    // free memory dot
                    const cx = (x + .5) * cellSize,
                          cy = (y + .5) * cellSize

                    fill( color.low )
                    rect(cx - .5 * dw, cy - .5 * dw, dw, dw)

                } else {
                    const lx = x * cellSize + margin,
                          ly = y * cellSize + margin

                    switch (cell.sel) {
                        case 1:
                            fill( color.marked )
                            break
                        case 2:
                            fill( color.focused )
                            break
                        default:
                            if (cell.locked) fill( color.locked )
                            else fill( color.low )
                    }
                    rect(lx, ly, mw, mw)

                    if (cell.signal) {
                        if (cell.signal.type === dry.ALLOC) stroke( color.alloc )
                        else stroke( color.free )
                    } else {
                        stroke( color.base )
                    }
                    rect(lx, ly, mw, mw)

                    if (env.probePid) {
                        const cx = (x + .5) * cellSize,
                              cy = (y + .5) * cellSize

                        fill('#ffff00')
                        baseMiddle()
                        alignCenter()
                        font(env.style.font.coreDebug.head)

                        text(`#${cell.pid}`, cx, cy)
                    }
                }
            }
        }

        restore()
    }

    poke(px, py) {
        const cx = this.lx(px),
              cy = this.ly(py),
              ix = floor(cx),
              iy = floor(cy)

        // log(`poke at [${ix}:${iy}]@(${cx}:${cy})`)
        const cell = this.cellAt(ix, iy)
        if (cell) cell.poke()
    }

    pick(px, py, ls) {
        const cx = this.lx(px),
              cy = this.ly(py),
              ix = floor(cx),
              iy = floor(cy)

        const cell = this.cellAt(ix, iy)
        if (cell) ls.push(cell)

        return cell
    }
}
