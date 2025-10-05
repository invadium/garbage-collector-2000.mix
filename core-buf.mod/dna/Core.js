class Core {

    constructor(st) {
        augment(this, {
            name:     'core',

            // port space
            x:         0,
            y:         0,
            w:         0,
            h:         0,
            cellSize:  20,

            // cell space
            cells:     [],
            cw:        16,
            ch:        16,

            terminals: [],
        }, st)
        this.clear()
    }

    clear() {
        const { cw, ch, cellSize } = this
        this.w = cw * cellSize
        this.h = ch * cellSize

        let id = 0
        for (let y = 0; y < ch; y++) {
            for (let x = 0; x < cw; x++) {
                const cell = this.cells[y * cw + x] = {
                    id:  ++id,
                    x:   x,
                    y:   y,
                    v:   math.rndz(.75),
                    sel: 0,

                    lastTouch: 0,
                    locked:    false,
                }
                // detect the edge and direction
                if (x === 0 && y !== 0 && y !== ch - 1) {
                    cell.edge = true
                    cell.dir  = dry.WEST
                }
                if (x === cw - 1 && y !== 0 && y !== ch - 1) {
                    cell.edge = true
                    cell.dir  = dry.EAST
                }
                if (y === 0 && x !== 0 && x !== cw - 1) {
                    cell.edge = true
                    cell.dir  = dry.NORTH
                }
                if (y === cw - 1 && x !== 0 && x !== cw - 1) {
                    cell.edge = true
                    cell.dir  = dry.SOUTH
                }
            }
        }
        this.capacity = this.cells.length
    }

    selectFreeEdgeCell() {
        return math.rnde( this.cells.filter(c => c.edge && c.v === 0 && !c.term) )
    }

    attachTerminal(term) {
        const targetCell = this.selectFreeEdgeCell()
        if (!targetCell) return false

        term.core = this
        term.cell = targetCell

        targetCell.v = 1
        targetCell.term = term
        targetCell.locked = true

        this.terminals.push(term)
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
            if (cell.v > 0 && cell.sel > 0) {
                // kill the cell
                cell.v   = 0
                cell.sel = 0
                // TODO vfx and potential damage to the process (SEG_FAULT)
            }
        }
    }

    allocate(cell) {
        if (!cell) return

        if (cell.v === 0) {
            cell.v   = 1
            cell.sel = 0
        }
    }

    free(cell) {
        if (!cell || cell.v === 0 || cell.locked) return false

        cell.v   = 0
        cell.sel = 0
    }

    flip(cell) {
        if (!cell) return

        if (cell.v === 0) this.allocate(cell)
        else this.free(cell)
    }


    evo(dt) {
        // TODO spawn malloc and free signals from terminals

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
        const dw     = .1  * cellSize,
              margin = .1  * cellSize,
              mw     = cellSize - 2 * margin

        save()
        // core space - the origin is form the core top-left
        translate(x - .5 * w, y - .5 * h)

        // hint the edge
        const lw = 1
        lineWidth(lw)
        stroke( hsl(.6, .6, .5) )
        rect(-lw, -lw, w + 2*lw, h + 2*lw)

        this.terminals.forEach(term => term.draw())

        lineWidth(1)
        const color = env.style.color.core
        for (let y = 0; y < ch; y++) {
            for (let x = 0; x < cw; x++) {
                const cell = this.cells[y * cw + x]

                if (cell.v) {
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

                    stroke( color.base )
                    rect(lx, ly, mw, mw)
                } else {
                    fill( color.low )
                    const cx = (x + .5) * cellSize,
                          cy = (y + .5) * cellSize
                    rect(cx - .5 * dw, cy - .5 * dw, dw, dw)
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
        if (cell) {
            // log(`touching @[${ix}:${iy}]`)

            if (cell.v === 0) {
                // === free cell ===
                if (env.probeAlloc) {
                    // DEBUG create a cell on LMB double click
                    if ($.env.time - cell.lastTouch < env.tune.doubleClickTimeout) {
                        this.allocate(cell)
                    }
                }

            } else if (!cell.locked) {
                // mark
                if (cell.sel === 0) cell.sel = 1
                else if (cell.sel === 1) cell.sel = 2
                else cell.sel = 0
            }
            cell.lastTouch = $.env.time
        }
    }

}
