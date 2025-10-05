const df = {
    name:         'label',
    text:         'default',
    color:        '#ffffff',
    font:         '24px pixel-operator',
    align:        'center',
    baseline:     'middle',
    x:             0,
    y:             0,
    rx:           .5,
    ry:           .5,
    shadowDx:      5,
    shadowDy:      5,
}

class Label {

    constructor(st) {
        extend(this, df, st)
    }

    draw() {
        save()

        ctx.textAlign = this.align
        ctx.textBaseline = this.baseline
        font(this.font)

        const tx = isNumber(this.rx)? rx(this.rx) : this.x
        const ty = isNumber(this.ry)? ry(this.ry) : this.y

        if (this.shadowColor) {
            fill(this.shadowColor)
            text(this.text, tx+this.shadowDx, ty+this.shadowDy)
        }
        fill(this.color)
        text(this.text, tx, ty)

        restore()
    }
}
