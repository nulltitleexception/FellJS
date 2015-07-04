precision mediump float;

varying highp vec2 texCoord;

uniform sampler2D texSampler;

void main(void) {
	gl_FragColor = texture2D(texSampler, vec2(texCoord.s, texCoord.t));
	gl_FragColor.r = 1;
}