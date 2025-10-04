#version 300 es
precision highp float;

in vec2 vTextureCoord;

uniform sampler2D uSampler;

out vec4 fragColor;

void main(void) {
    //gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
    //fragColor = texture(uSampler, vTextureCoord);

    float lightR1 = 100.0;
    float lightR2 = 900.0;
    vec4  lightPos = vec4(550.0, 400.0, 0.0, 0.0);
    float dist = length(lightPos.xyz - gl_FragCoord.xyz);

    float lightFactor = 1.0 - clamp((dist - lightR1)/(lightR2 - lightR1), 0.0, 1.0);

    fragColor = texture(uSampler, vTextureCoord);
    //fragColor = texture(uSampler, vTextureCoord) * lightFactor;
}
