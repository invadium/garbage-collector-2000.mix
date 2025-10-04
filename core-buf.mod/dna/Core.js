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
        }, st)
        this.clear()
    }

    clear() {
        const { cw, ch, cellSize } = this
        this.w = cw * cellSize
        this.h = ch * cellSize

        for (let y = 0; y < ch; y++) {
            for (let x = 0; x < cw; x++) {
                this.cells[y * cw + x] = {
                    x:   x,
                    y:   y,
                    v:   math.rndz(.75),
                    sel: 0,

                    lastTouch: 0,
                }
            }
        }
        this.capacity = this.cells.length
    }

    lx(px) {
        return (px - this.x + .5 * this.w) / this.cellSize
    }

    ly(py) {
        return (py - this.y + .5 * this.h) / this.cellSize
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
              margin = .05 * cellSize,
              mw     = cellSize - 2 * margin

        save()
        translate(x - .5 * w, y - .5 * h)

        // hint the edge
        const lw = 2
        lineWidth(lw)
        stroke( hsl(.6, .6, .5) )
        rect(-lw, -lw, w + 2*lw, h + 2*lw)

        for (let y = 0; y < ch; y++) {
            for (let x = 0; x < cw; x++) {
                const cell = this.cells[y * cw + x]

                if (cell.v) {
                    switch (cell.sel) {
                        case 1:
                            fill( hsl(.25, .6, .5) )
                            break
                        case 2:
                            fill( hsl(.01, .6, .5) )
                            break
                        default:
                            fill( hsl(.6, .6, .5) )
                    }
                    rect(x * cellSize + margin, y * cellSize + margin, mw, mw)
                } else {
                    fill( hsl(.6, .6, .5) )
                    const cx = (x + .5) * cellSize,
                          cy = (y + .5) * cellSize
                    rect(cx - .5 * dw, cy - .5 * dw, dw, dw)
                }
            }
        }

        restore()
    }

    allocate(cell) {
        if (!cell) return

        if (cell.v === 0) {
            cell.v   = 1
            cell.sel = 0
        }
    }

    free(cell) {
        if (!cell || cell.v === 0) return false

        cell.v   = 0
        cell.sel = 0
    }

    flip(cell) {
        if (!cell) return

        if (cell.v === 0) this.allocate(cell)
        else this.free(cell)
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

            } else {
                // select
                if (cell.sel === 0) cell.sel = 1
                else if (cell.sel === 1) cell.sel = 2
                else cell.sel = 0
            }
            cell.lastTouch = $.env.time
        }
    }

}
