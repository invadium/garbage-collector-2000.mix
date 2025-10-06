const df = {
    alive:  true,
    text:   'text',
    x:      0,
    y:      0,
    dx:     0,
    dy:     0,
    time:   0,
    ttl:    5,
    tti:    1,
    ttf:    1,
    align:  'left',
    base:   'top',
    font:   '8px coolville',
    color:  '#ffffff',
    shadow: '#000000',
    sdx:    2,
    sdy:    2,
}

// text with fade-in/fade-out and flying effects
class FloatingText {

    constructor(st) {
        extend(this, df, st)

        this.tta = this.ttl - this.ttf
        if (this.tta < 0) this.tta = 0
        if (st.rx) this.x = st.rx/100 * ctx.width;
        else this.x = st.x
        if (st.ry) this.y = st.ry/100 * ctx.height;
        else this.y = st.y
    }

    evo(dt) {
        this.time += dt
        this.x += this.dx * dt
        this.y += this.dy * dt

        if (this.time > this.ttl) {
            this.alive = false
            this.__.detach(this)
        }
    }

    draw() {
        if (!this.alive) return 

        if (this.time > this.tta) {
            alpha((this.ttl - this.time) / (this.ttl - this.tta))
        } else if (this.time < this.tti) {
            alpha(this.time / this.tti)
        } else {
            alpha(1)
        }

        font(this.font)
        ctx.textAlign = this.align
        ctx.textBaseline = this.base

        fill(this.shadow)
        text(this.text, this.x + this.sdx, this.y + this.sdy)

        fill(this.color)
        text(this.text, this.x, this.y)
        alpha(1)
    }
}
