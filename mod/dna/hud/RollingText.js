
class RollingText {

    constructor(st) {
        extend(this,
            {
                textColor:    '#ffffff',
                shadowColor:  '#000000',
                font:         '16px moon',
                lineHeight:   20,
                textAlign:    'center',
                textBaseline: 'middle',
                x:             0,
                y:             0,
                w:             ctx.width,
                h:             ctx.height,
                rx:           .5,
                ry:           .5,
                shadowDx:      5,
                shadowDy:      5,

                timer:         0,
                line:          0,
                lineTime:      1,
                lineSpeed:    -20,
                keepLineFor:   20,      // seconds
                sdx:           2,
                sdy:           2,
            }, st )
        this.lines = this.text.split('\n')
    }

    drawText() {
        // just adjust timings
        this.lineSpeed = -this.ih / this.keepLineFor
        this.lineTime = abs(this.lineHeight / this.lineSpeed)
    }

    evo(dt) {
        if (this.line >= this.lines.length) return // nothing to spawn

        this.timer += dt
        if (this.timer > this.lineTime) {
            this.timer -= this.lineTime

            const line = this.lines[ this.line++ ]
            const tx = this.x + this.w * this.rx
            const ty = this.y + this.h * this.ry

            this.__.spawn( dna.hud.FloatingText, {
                roll:         true,
                x:            tx,
                y:            ty,
                dx:           0,
                dy:           this.lineSpeed,
                text:         line,
                font:         this.font,
                color:        this.textColor,
                shadow:       this.shadowColor,
                base:         this.textBaseline,
                align:        this.textAlign,
                ttl:          this.keepLineFor,
                sdx:          this.sdx,
                sdy:          this.sdy,
            })
        }
    }
}
