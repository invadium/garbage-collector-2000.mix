function frag(src, name, path, base) {
    log(`creating and compiling fragment shader [${name}]...`)
    try {
        const fShader = gl.createShader(gl.FRAGMENT_SHADER)
        gl.shaderSource(fShader, src)
        gl.compileShader(fShader)
        if (!gl.getShaderParameter(fShader, gl.COMPILE_STATUS)) {
            const glLog = gl.getShaderInfoLog(fShader)
            throw `can't compile fragment shader ${path}:${glLog}`
        }
        if (!pin.shader) pin.shader = {}
        pin.shader[name] = fShader
    } catch(e) {
        log.err(e)
    }
    return `fragment-shader-dump/${name}:[${src}]`
}
