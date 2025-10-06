function mouseDown(e) {
    const state = lab.control.state.leadNode()
    if (state) {
        if (isFun(state.mouseDown)) state.mouseDown(e)
        else if (state.gtrap && isFun(state.gtrap.mouseDown)) state.gtrap.mouseDown(e)
        else if (state.trap && isFun(state.trap.mouseDown)) state.trap.mouseDown(e)
    }
}
