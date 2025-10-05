const style = {

    color: {
        core: {
            low:     hsl(.6,  .4, .35),
            base:    hsl(.6,  .5, .5),
            alloc:   hsl(.6,  .75, .75),
            free:    hsl(.01, .7,  .65),
            locked:  hsl(.6,  .25, .25),
            marked:  hsl(.2,  .6, .4),
            focused: hsl(.01, .6, .4),
        },
    },

    font: {
        main: {
            family: 'basis33',
            size:   24,
        },
        titleBar: {
            family: 'basis33',
            size:   32,
        },
        title: {
            family: 'moon',
            size:   64,
        },
        menu: {
            family: 'moon',
            size:   32,
        },
        menuHigh: {
            family: 'moon',
            size:   36,
        },
        credits: {
            family: 'moon',
            size:   32,
        },

        debug: {
            family: 'basis33',
            size: 24,
        },
        coreDebug: {
            family: 'basis33',
            size: 8,
        },
    }
}

function classifyFonts() {
    for (let id in style.font) {
        const font = style.font[id]
        font.id = id
        font.head = font.size + 'px ' + font.family
    }
}

(function setupStyles() {
    classifyFonts()
})()

