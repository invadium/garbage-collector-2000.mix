const Z = 0

function draw() {
    const w = ctx.width,
          h = ctx.height

    //ctx.clearRect(0, 0, ctx.width, ctx.height)
    //background('#165955')
    const gradient = ctx.createLinearGradient(0, 0, 0, h)
    gradient.addColorStop(0,  hsl(.75, .7, .25))
    gradient.addColorStop(.3, hsl(.75, .6, .15))
    gradient.addColorStop(.7, hsl(.75, .5, .1))
    gradient.addColorStop(1,  hsl(.75, .4, .05))
    fill(gradient)
    rect(0, 0, w, h)
    
    // highlight edges
    //stroke('#ffff00')
    //lineWidth(4)
    //rect(0, 0, w, h)
}
