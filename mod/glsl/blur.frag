#version 300 es
precision highp float;

in vec2 vTextureCoord;

uniform sampler2D uTextureSampler;

out vec4 fragColor;

vec4 blur5(sampler2D image, vec2 uv, vec2 resolution, vec2 direction) {
  vec4 color = vec4(0.0);
  vec2 off1 = vec2(1.3333333333333333) * direction;
  color += texture(image, uv) * 0.29411764705882354;
  color += texture(image, uv + (off1 / resolution)) * 0.35294117647058826;
  color += texture(image, uv - (off1 / resolution)) * 0.35294117647058826;
  return color;
}

vec4 blur9(sampler2D image, vec2 uv, vec2 resolution, vec2 direction) {
  vec4 color = vec4(0.0);
  vec2 off1 = vec2(1.3846153846) * direction;
  vec2 off2 = vec2(3.2307692308) * direction;
  color += texture(image, uv) * 0.2270270270;
  color += texture(image, uv + (off1 / resolution)) * 0.3162162162;
  color += texture(image, uv - (off1 / resolution)) * 0.3162162162;
  color += texture(image, uv + (off2 / resolution)) * 0.0702702703;
  color += texture(image, uv - (off2 / resolution)) * 0.0702702703;
  return color;
}

vec4 blur13(sampler2D image, vec2 uv, vec2 resolution, vec2 direction) {
  vec4 color = vec4(0.0);
  vec2 off1 = vec2(1.411764705882353) * direction;
  vec2 off2 = vec2(3.2941176470588234) * direction;
  vec2 off3 = vec2(5.176470588235294) * direction;
  color += texture(image, uv) * 0.1964825501511404;
  color += texture(image, uv + (off1 / resolution)) * 0.2969069646728344;
  color += texture(image, uv - (off1 / resolution)) * 0.2969069646728344;
  color += texture(image, uv + (off2 / resolution)) * 0.09447039785044732;
  color += texture(image, uv - (off2 / resolution)) * 0.09447039785044732;
  color += texture(image, uv + (off3 / resolution)) * 0.010381362401148057;
  color += texture(image, uv - (off3 / resolution)) * 0.010381362401148057;
  return color;
}

void main(void) {
    //gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
    //fragColor = texture(uTextureSampler, vTextureCoord);

    float lightR1 = 100.0;
    float lightR2 = 900.0;
    vec4 lightPos = vec4(550.0, 400.0, 0.0, 0.0);
    float dist = length(lightPos.xyz - gl_FragCoord.xyz);

    float lightFactor = 1.0 - clamp((dist - lightR1)/(lightR2 - lightR1), 0.0, 1.0);

    //fragColor = texture(uTextureSampler, vTextureCoord);
    fragColor = blur9(uTextureSampler, vTextureCoord, vec2(250.0, 200.0), vec2(0.0, 1.0));
    //fragColor = blur9(uTextureSampler, vTextureCoord, vec2(250.0, 200.0), vec2(0.0, 1.0)) * lightFactor;
}
