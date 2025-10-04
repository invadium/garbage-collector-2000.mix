function syncViewportSize() {
    ctx.width  = $.canvas.width
    ctx.height = $.canvas.height
    ctx.canvas.width  = $.canvas.width
    ctx.canvas.height = $.canvas.height
    ctx.canvas.style.width  = $.canvas.style.width
    ctx.canvas.style.height = $.canvas.style.height
}
