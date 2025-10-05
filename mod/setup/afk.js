function afk() {
    const afk = env.config.afk
    if (!afk) return

    const msg = isString(afk)? afk : 'Coffee Break'
    lab.overlay.spawn( dna.hud.Label, {
        name: 'coffeeBreakLabel',
        rx:   .5,
        ry:   .45,
        font:  env.style.font.title.head,
        color: env.style.color.title,
        text:  msg,
    })

    lab.overlay.spawn( dna.hud.Label, {
        name: 'afkLabel',
        rx:   .5,
        ry:   .55,
        font:  env.style.font.title.head,
        color: env.style.color.title,
        text: 'Be Right Back Soon...',
    })

}
afk.Z = 11
