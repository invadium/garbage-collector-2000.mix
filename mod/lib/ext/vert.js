function vert(src, name, path, base) {
    log(`creating and compiling vertex shader [${name}]...`)
    try {
        const vShader = gl.createShader(gl.VERTEX_SHADER)
        gl.shaderSource(vShader, src)
        gl.compileShader(vShader)
        if (!gl.getShaderParameter(vShader, gl.COMPILE_STATUS)) {
            const glLog = gl.getShaderInfoLog(vShader)
            throw `can't compile vertex shader ${path}:${glLog}`
        }
        if (!pin.shader) pin.shader = {}
        pin.shader[name] = vShader
    } catch(e) {
        log.err(e)
    }
    return `vertex-shader-dump/${name}:[${src}]`
}
