if (typeof GRAPHICS === "undefined") {
    var GRAPHICS = {};
} else {
    alert("Unable to safely instantiate GRAPHICS");
}

GRAPHICS.renderer = function(canv) {
    var canvas = canv;
    var gl;

    function initGL() {
        try {
            gl = canvas.getContext("experimental-webgl");
            gl.viewportWidth = canvas.width;
            gl.viewportHeight = canvas.height;
        } catch (e) {}
        if (!gl) {
            alert("Could not initialise WebGL.");
        }
    }



    function getFileDataSync(url) {
        var req = new XMLHttpRequest();
        req.open("GET", url, false);
        req.send(null);
        return (req.status == 200) ? req.responseText : null;
    };

    function getShaderFromFile(name, type) {
        var shader;
        if (type == "fragment") {
            shader = gl.createShader(gl.FRAGMENT_SHADER);
        } else if (type == "vertex") {
            shader = gl.createShader(gl.VERTEX_SHADER);
        } else {
            return null;
        }
        var str = getFileDataSync("res/shader/" + name + "-" + type + ".glsl");

        gl.shaderSource(shader, str);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            alert(gl.getShaderInfoLog(shader));
            return null;
        }

        return shader;
    }

    function loadShader(name) {
        var shaderProgram;

        var fragmentShader = getShaderFromFile(name, "fragment");
        var vertexShader = getShaderFromFile(name, "vertex");

        shaderProgram = gl.createProgram();
        gl.attachShader(shaderProgram, vertexShader);
        gl.attachShader(shaderProgram, fragmentShader);
        gl.linkProgram(shaderProgram);

        if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
            alert("Could not initialise shaders");
        }

        gl.useProgram(shaderProgram);

        shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "vertexPosition");
        gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

        shaderProgram.cameraUniform = gl.getUniformLocation(shaderProgram, "camera");
        shaderProgram.positionUniform = gl.getUniformLocation(shaderProgram, "pos");
        shaderProgram.halfScreenUniform = gl.getUniformLocation(shaderProgram, "halfScreen");
        return shaderProgram;
    }

    function createRectBuffer(width, height) {
        var buf;
        buf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        vertices = [
            width/2, height/2,
            width/-2, height/2,
            width/2, height/-2,
            width/-2, height/-2
        ];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
        buf.itemSize = 2;
        buf.numItems = 4;
        buf.bind = function(){
            gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        }
        return buf;
    }

    var shader;
    var buffer;
    function drawScene() {
        gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.vertexAttribPointer(shader.vertexPositionAttribute, buffer.itemSize, gl.FLOAT, false, 0, 0);

        gl.useProgram(shader);
        gl.uniform2f(shader.cameraUniform, 0, 0);
        gl.uniform2f(shader.positionUniform, 0, 0);
        gl.uniform2f(shader.halfScreenUniform, canvas.width / 2, canvas.height / 2);

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, buffer.numItems);
    }



    function webGLStart() {
        initGL(canvas);
        shader = loadShader("default");
        buffer = createRectBuffer(400,400);

        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.enable(gl.DEPTH_TEST);

        drawScene();
    }

    return {
        webGLStart: webGLStart
    };
};