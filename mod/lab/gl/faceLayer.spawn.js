const faceLayer = {
    DNA:   'FBLayer',
    Z:      7,
    scale:  1,
    hidden: false,

    fixProgram() {
        //this.glProg = pin.glProg.blur
        this.glProg = pin.glProg.basic
    }
}
