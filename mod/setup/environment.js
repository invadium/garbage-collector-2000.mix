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
            env[prop] = env.config[prop]
            $.core.env[prop] = env.config[prop]
        }
    }
}
