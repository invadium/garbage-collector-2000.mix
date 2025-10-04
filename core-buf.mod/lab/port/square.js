function init() {
    this.x = 0
    this.y = 0
    this.r = 200
}

function draw() {
    const { x, y, r } = this

    lineWidth(5)
    stroke( hsl(.35, .5, .5) )
    rect(x-r, y-r, 2*r, 2*r)

    const r2 = .5 * r
    line(x-r2, y,    x+r2, y)
    line(x,    y-r2, x,    y+r2)
}
