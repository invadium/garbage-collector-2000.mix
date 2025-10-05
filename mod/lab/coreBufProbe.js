const Z = 101

const B = 10

function draw() {
    if (!env.probeCore) return
    const framebuffer = $.mem

    const w = rx(.25)
    const h = ry(.25)
    const hb = ctx.width - w - B
    const vb = ctx.height - h - B
    smooth()

    lineWidth(1)
    stroke( hsl(.2, .5, .5) )
    rect(hb, vb, w, h)

    image(framebuffer.ctx.canvas, hb-1, vb-1, w+2, h+2)
}
