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

    function getShaderFromFile(gl, name, type) {
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

    var shaderProgram;

    function initShaders() {
        var fragmentShader = getShaderFromFile(gl, "default", "fragment");
        var vertexShader = getShaderFromFile(gl, "default", "vertex");

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
    }

    function setUniforms() {
        gl.uniform2f(shaderProgram.cameraUniform, false, 0, 0);
        gl.uniform2f(shaderProgram.positionUniform, false, 0, 0);
    }



    var squareVertexPositionBuffer;

    function initBuffers() {
        squareVertexPositionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
        vertices = [
            1.0, 1.0, -1.0, 1.0,
            1.0, -1.0, -1.0, -1.0
        ];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
        squareVertexPositionBuffer.itemSize = 2;
        squareVertexPositionBuffer.numItems = 4;
    }


    function drawScene() {
        gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, squareVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
        setUniforms();
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, squareVertexPositionBuffer.numItems);
    }



    function webGLStart() {
        initGL(canvas);
        initShaders();
        initBuffers();

        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.enable(gl.DEPTH_TEST);

        drawScene();
    }

    return {
        webGLStart: webGLStart
    };
};