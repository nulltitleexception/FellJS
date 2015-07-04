    attribute vec2 vertexPosition;

    uniform vec2 camera;
    uniform vec2 pos;

    void main(void) {
        gl_Position = vec4((camera - VertexPosition) + pos, 0, 1.0);
    }