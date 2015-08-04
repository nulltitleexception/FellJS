if (typeof GRAPHICS === "undefined") {
    var GRAPHICS = {};
} else {
    alert("Unable to safely instantiate GRAPHICS");
}

GRAPHICS.renderer = (function(canv) {
    var canvas = canv;
    var gl = canvas.getContext("experimental-webgl");

    function initGL() {
        try {
            gl.viewportWidth = canvas.width;
            gl.viewportHeight = canvas.height;
        } catch (e) {}
        if (!gl) {
            alert("Could not initialise WebGL.");
        }
        gl.activeTexture(gl.TEXTURE0);
        //gl.enable(gl.DEPTH_TEST);
        //gl.depthFunc(gl.LESS);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
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
        var buf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buf;
        var vertices = [
            width / 2.0, height / 2.0,
            width / -2.0, height / 2.0,
            width / 2.0, height / -2.0,
            width / -2.0, height / -2.0
        ];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
        gl.vertexAttribPointer(getShader("default").vertexPositionAttribute, 2, gl.FLOAT, false, 0, 0);
        buf.bind = function() {
            gl.bindBuffer(gl.ARRAY_BUFFER, this);
        	gl.vertexAttribPointer(getShader("default").vertexPositionAttribute, 2, gl.FLOAT, false, 0, 0);
        };
        buf.itemSize = 2;
        buf.numItems = 4;
        buf.width = width;
        buf.height = height;
        return buf;
    }

    function loadTexture(name) {
        var tex = gl.createTexture();
        var image = new Image();
        var texo = {
            texture: tex,
            image: image,
            ready: false
        };
        image.onload = function() {
            handleTextureLoaded(texo);
        };
        image.src = "res/tex/" + name + ".png";
        return texo;
    }

    function handleTextureLoaded(textureObj) {
        gl.bindTexture(gl.TEXTURE_2D, textureObj.texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textureObj.image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.bindTexture(gl.TEXTURE_2D, null);
        textureObj.ready = true;
    }

    function loadSprite(name) {
        var str = getFileDataSync("res/sprite/" + name + ".json");
        var sprite = JSON.parse(str);
        if ("tex" in sprite) {
            sprite.texture = getTexture(sprite.tex);
        } else {
            sprite.texture = getTexture(name);
        }
        sprite.buffer = getBuffer(sprite.width, sprite.height);
        sprite.draw = function(shader, x, y) {
           	this.buffer.bind();
            if (this.texture.ready) {
                gl.bindTexture(gl.TEXTURE_2D, this.texture.texture);
            }
            gl.uniform2f(shader.positionUniform, x, y);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, this.buffer.numItems);
        };
        console.log(name + ": " + sprite.buffer.width + ", " + sprite.buffer.height)
        return sprite;
    }

    var externalDraw = function() {
        return true;
    };

    function drawScene() {
        gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        externalDraw();

        window.requestAnimFrame(drawScene);
    }



    function webGLStart(drawFunc) {
        externalDraw = drawFunc;
        window.requestAnimFrame = (function() {
            return window.requestAnimationFrame ||
                window.webkitRequestAnimationFrame ||
                window.mozRequestAnimationFrame ||
                window.oRequestAnimationFrame ||
                window.msRequestAnimationFrame ||
                function(callFunc) {
                    window.setTimeout(callFunc, 20);
                };
        })();
        initGL(canvas);

        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.enable(gl.DEPTH_TEST);

        drawScene();
    }

    var shaders = new Object();

    function getShader(name) {
        if ((name) in shaders) {
            return shaders[name];
        } else {
            shaders[name] = loadShader(name);
            return shaders[name];
        }
    }

    var textures = new Object();

    function getTexture(name) {
        if ((name) in textures) {
            return textures[name];
        } else {
            textures[name] = loadTexture(name);
            return textures[name];
        }
    }

    var sprites = new Object();

    function getSprite(name) {
        if ((name) in sprites) {
            return sprites[name];
        } else {
            sprites[name] = loadSprite(name);
            return sprites[name];
        }
    }

    var buffers = new Object();

    function getBuffer(width, height) {
        var bname = width + "x" + height;
        if ((bname) in buffers) {
            return buffers[bname];
        } else {
            buffers[bname] = createRectBuffer(width, height);
            return buffers[bname];
        }
    }

    return {
        GL: gl,
        webGLStart: webGLStart,
        getShader: getShader,
        getSprite: getSprite,
    };
});