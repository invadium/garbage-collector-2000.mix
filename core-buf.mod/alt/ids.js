const ids = {
    cell:     0,
    link:     0,
    terminal: 0,
    signal:   0,

    reset: function() {
        const _ = this
        Object.keys(this).forEach(key => {
            const val = _[key]
            if (isNum(val)) {
                _[key] = 0
            }
        })
    },
}
