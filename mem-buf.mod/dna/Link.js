class Link {

    constructor(st) {
        const id = ++ids.link
        extend(this, {
            id:    id,
            pid:   0,
            name: 'link' + id,

            origin: null,
            dest:   null,
            signal: null,

            _smellId: 0,

            dead:   false,
        }, st)
    }

    acceptSignal(signal) {
        if (this.signal) return false

        this.signal = signal
        signal.setHolder(this)

        return true
    }

    releaseSignal() {
        this.signal = null
    }

    isSignaling() {
        return (this.signal !== null)
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

        const lw = this.signal? 2 : 1
        lineWidth(lw)
        if (this.signal) {
            switch(this.signal.type) {
                case dry.ALLOC:   stroke( env.color.id.alloc );   break;
                case dry.RELEASE: stroke( env.color.id.release ); break;
                case dry.FREE:    stroke( env.color.id.free );    break;
            }
        } else {
            stroke( env.color.core.base )
        }

        line(ox, oy, tx, ty)
    }

    getRemote(cell) {
        if (!cell) return

        if (this.origin === cell) return this.dest
        else if (this.dest === cell) return this.origin
        else return null
    }

    getLocal(cell) {
        if (!cell) return

        if (this.origin === cell || this.dest === cell) return cell
    }

    kill() {
        if (this.origin) this.origin.detachLink(this)
        if (this.dest) this.dest.detachLink(this)
        this.dead = true
    }

}
