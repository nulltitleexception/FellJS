    attribute vec2 vertexPosition;

    uniform vec2 camera;
    uniform vec2 pos;
    uniform vec2 halfScreen;

    void main(void) {
        gl_Position = vec4(((camera - vertexPosition) + pos) / halfScreen, 0, 1.0);
    }