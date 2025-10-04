const Z = 0

function draw() {
    const w = ctx.width,
          h = ctx.height

    //ctx.clearRect(0, 0, ctx.width, ctx.height)
    //background('#165955')
    const gradient = ctx.createLinearGradient(0, 0, 0, h)
    gradient.addColorStop(0, '#39bfbf')
    gradient.addColorStop(.3, '#155955')
    gradient.addColorStop(.7, '#004938')
    gradient.addColorStop(1, '#010d0d')
    fill(gradient)
    rect(0, 0, w, h)
    
    // highlight edges
    //stroke('#ffff00')
    //lineWidth(4)
    //rect(0, 0, w, h)
}
