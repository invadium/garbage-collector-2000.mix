class Link {

    constructor(st) {
        const id = ++ids.link
        extend(this, {
            id:    id,
            pid:   0,
            name: 'link' + id,

            origin: null,
            dest:   null,

            dead:   false,
        }, st)
    }

    evo(dt) {
        // just in case we've missed the link
        if (this.origin.isFree() || this.dest.isFree()) {
            const { origin, dest } = this
            log.warn(`[${env.mtime}]:[${origin.x}:${origin.y}]-x-[${dest.x}:${dest.y}] - broken link!`)
            this.kill()
            return
        }
    }

    draw() {
        const { __, origin, dest } = this
        if (this.dead || !origin || !dest) return

        const ox = __.cx( origin.x ),
              oy = __.cy( origin.y ),
              tx = __.cx( dest.x ),
              ty = __.cy( dest.y )

        const lw = 1
        lineWidth(lw)
        stroke( env.style.color.core.base )

        line(ox, oy, tx, ty)
    }

    kill() {
        if (this.origin) this.origin.detachLink(this)
        if (this.dest) this.dest.detachLink(this)
        this.dead = true
    }

}
