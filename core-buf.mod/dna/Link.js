class Link {

    constructor(st) {
        const id = ++ids.link
        extend(this, {
            id:    id,
            pid:   0,
            name: 'link' + id,
        }, st)
    }

}
