class FBLayer {

    constructor(st) {
        augment(this, {
            Z:        5,
            scale:    1,
            vertices: [
                // left triangle
                -1,  1,  0,
                 1,  1,  0,
                -1, -1,  0,

                // right triangle
                 1,  1,  0,
                -1, -1,  0,
                 1, -1,  0
            ],
            UVs: [
                // 1
                0.0, 0.0, 1.0, 0.0, 0.0, 1.0,
                // 2
                1.0, 0.0, 0.0, 1.0, 1.0, 1.0,
            ],
        }, st)
    }

    init() {
        log('setting up buffers...')

        // vertices
        for (let i = 0; i < this.vertices.length; i++) {
            this.vertices[i] *= this.scale
        }
        const verticeBuffer = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, verticeBuffer)
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array(this.vertices),
            gl.STATIC_DRAW
        )
        this.verticeBuffer = verticeBuffer

        // UVs
        const textureCoordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array(this.UVs),
            gl.STATIC_DRAW,
        )
        this.textureCoordBuffer = textureCoordBuffer
    }

    fixCanvas() {
        return $.core.canvas
    }

    fixTexture() {
        //return res.texture.compass.tid
        const tid = gl.createTexture()
        gl.bindTexture(gl.TEXTURE_2D, tid)
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.fixCanvas())
        gl.generateMipmap(gl.TEXTURE_2D)
        gl.bindTexture(gl.TEXTURE_2D, null)
        this.fixedTexture = tid
        return tid
    }

    unfixTexture() {
        if (!this.fixedTexture) return
        gl.deleteTexture(this.fixedTexture)
    }

    fixProgram() {
        this.glProg = pin.glProg.basic
    }

    draw() {
        this.fixProgram()
        gl.useProgram(this.glProg)

        const vertexPositionAttribute = gl.getAttribLocation(this.glProg, 'aVertexPosition')
        gl.enableVertexAttribArray(vertexPositionAttribute)
        gl.bindBuffer(gl.ARRAY_BUFFER, this.verticeBuffer)
        gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0)

        const textureCoordAttribute = gl.getAttribLocation(this.glProg, 'aTextureCoord')
        gl.enableVertexAttribArray(textureCoordAttribute)
        gl.bindBuffer(gl.ARRAY_BUFFER, this.textureCoordBuffer)
        gl.vertexAttribPointer(textureCoordAttribute, 2, gl.FLOAT, false, 0, 0)

        const samplerLocation = gl.getUniformLocation(this.glProg, 'uSampler')

        // Tell WebGL we want to affect texture unit 0
        gl.activeTexture(gl.TEXTURE0)
        // Bind the texture to texture unit 0
        gl.bindTexture(gl.TEXTURE_2D, this.fixTexture())
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
        // Prevents s-coordinate wrapping (repeating).
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
        // Prevents t-coordinate wrapping (repeating).
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
        //gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)

        // Tell the shader we bound the texture to texture unit 0
        gl.uniform1i(samplerLocation, 0);

        gl.drawArrays(gl.TRIANGLES, 0, 6)

        this.unfixTexture()
    }
}
