function environment() {
    // pin memory core framebuffer to the root mod
    $.mem = mod['mem-buf']

    // copy debug and trace properties
    for (const prop in env.config) {
        if (prop.startsWith('debug')
                || prop.startsWith('trace')
                || prop.startsWith('probe')
                || prop.startsWith('enable')
                || prop.startsWith('disable')) {
            let val = env.config[prop]

            // normalize special cases
            switch(prop) {
                case 'enableCosmicRays':
                    if (isStr(val)) {
                        val = parseFloat(val)
                    }
                    break
            }

            env[prop]        = val
            $.mem.env[prop] = val
        }
    }

    env.link($.mem.env.tune)
    env.link($.mem.env.style)
}
environment.Z = 1
