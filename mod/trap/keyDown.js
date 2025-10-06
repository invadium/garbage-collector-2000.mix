function keyDown(e) {
    const state = lab.control.state.leadNode()
    if (state) {
        if (isFun(state.keyDown)) state.keyDown(e)
        if (state.trap && isFun(state.trap.keyDown)) state.trap.keyDown(e)
    }
}
