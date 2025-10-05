function resize() {
    lib.util.syncViewportSize()
    // MUST redraw the content to fill the modified framebuffer and avoid flickering
    lab.draw()
}
