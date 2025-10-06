function keyDown(e) {
    const state = lab.control.state.leadNode()
    if (state) {
        if (isFun(state.keyDown)) state.keyDown(e)
        else if (state.gtrap && isFun(state.gtrap.keyDown)) state.gtrap.keyDown(e)
        else if (state.trap && isFun(state.trap.keyDown)) state.trap.keyDown(e)
    }
}
