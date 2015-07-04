    attribute vec2 vertexPosition;

    uniform vec2 camera;
    uniform vec2 pos;
    uniform vec2 halfScreen;

    void main(void) {
        gl_Position = vec4(((camera - vertexPosition) + pos) / vec2(500,500), 0, 1.0);
    }