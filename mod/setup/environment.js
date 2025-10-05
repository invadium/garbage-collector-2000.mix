function environment() {
    // pin core memory framebuffer to the root mod
    $.core = mod['core-buf']

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
            $.core.env[prop] = val
        }
    }

    env.link($.core.env.tune)
    env.link($.core.env.style)
}
