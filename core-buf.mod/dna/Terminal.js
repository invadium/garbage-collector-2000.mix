class Terminal {

    constructor(st) {
        augment(this, {
            name: 'terminal' + (++id.terminal)
        }, st)
    }

    evo(dt) {
        // TODO spawn some signals?
    }

    draw() {
        const cell = this.cell

        const lw = 2
        lineWidth(lw)
        stroke( env.style.color.core.base )

        const cx = this.core.cx( cell.x ),
              cy = this.core.cy( cell.y )
        let dx = 0, dy = 0
        switch(cell.dir) {
            case dry.NORTH:
                dy = -1
                break
            case dry.WEST:
                dx = -1
                break
            case dry.SOUTH:
                dy = 1
                break
            case dry.EAST:
                dx = 1
                break
        }
        const linkLen = ctx.width
        line(cx, cy, cx + dx * linkLen, cy + dy * linkLen)
    }

}
