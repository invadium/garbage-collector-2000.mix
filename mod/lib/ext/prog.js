function prog(src, name, path) {
    const ids = src.trim().split(':')
    if (ids.length !== 2) throw 'a vertex and a fragment shaders expected to be defined in .prog'

    const vShader = pin.shader[ ids[0] ],
          fShader = pin.shader[ ids[1] ]

    if (!vShader) throw `Can't find vertex shader [${ids[0]}]`
    if (!fShader) throw `Can't find fragment shader [${ids[1]}]`

    const glProgram = gl.createProgram()
    gl.attachShader(glProgram, vShader)
    gl.attachShader(glProgram, fShader)

    gl.linkProgram(glProgram)
    gl.validateProgram(glProgram)
    if (!gl.getProgramParameter(glProgram, gl.VALIDATE_STATUS)) {
        const glLog = gl.getProgramInfoLog(glProgram)
        log.err(`unable to link the WebGL program: ${glLog}`)
    }

    // won't work with multiple programs!
    gl.useProgram(glProgram)

    if (!pin.glProg) pin.glProg = {}
    pin.glProg[name] = glProgram

    return glProgram
}
