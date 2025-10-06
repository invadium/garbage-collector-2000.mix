function mouseUp(e) {

    const state = lab.control.state.leadNode()
    if (state) {
        if (isFun(state.mouseUp)) state.mouseUp(e)
        if (state.trap && isFun(state.trap.mouseUp)) state.trap.mouseUp(e)
    }
}
