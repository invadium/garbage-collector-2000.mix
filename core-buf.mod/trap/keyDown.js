function keyDown(e) {

    switch(e.code) {
        case 'KeyX':
        case 'Space':
            _.core.sweep()
            break
    }

}
