    attribute vec2 vertexPosition;

    uniform vec2 camera;
    uniform vec2 pos;
    uniform vec2 halfScreen;

    varying highp vec2 texCoord;

    void main(void) {
    	if (vertexPosition.x <= 0.0){
    		texCoord.x = 0.0;
    	} else {
    		texCoord.x = 1.0;
    	}
    	if (vertexPosition.y <= 0.0){
    		texCoord.y = 0.0;
    	} else {
    		texCoord.y = 1.0;
    	}
        gl_Position = vec4(((vertexPosition - camera) + pos) / -halfScreen, 0, 1.0);
    }