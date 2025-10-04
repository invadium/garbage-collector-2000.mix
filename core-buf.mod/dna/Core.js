class Core {

    constructor(st) {
        augment(this, {
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
                    x: x,
                    y: y,
                    v: math.rndz(.75),
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

    evo(dt) {
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

                fill( hsl(.6, .6, .5) )

                if (cell.v) {
                    rect(x * cellSize + margin, y * cellSize + margin, mw, mw)
                } else {
                    const cx = (x + .5) * cellSize,
                          cy = (y + .5) * cellSize
                    rect(cx - .5 * dw, cy - .5 * dw, dw, dw)
                }
            }
        }

        restore()
    }

    poke(px, py, st) {
        const cx = this.lx(px),
              cy = this.ly(py),
              ix = floor(cx),
              iy = floor(cy)

        log(`poke at [${ix}:${iy}]@(${cx}:${cy})`)
        const cell = this.cellAt(ix, iy)
        if (cell) {
            if (st.action === 1) cell.v = 1
            else cell.v = 0
        }
    }

}
