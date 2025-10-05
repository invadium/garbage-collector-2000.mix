function keyDown(e) {

    switch(e.code) {
        case 'KeyX':
        case 'Space':
            $.core.sweep()
            break
    }

}
