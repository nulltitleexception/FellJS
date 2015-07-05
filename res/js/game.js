var JS_GAME = {};

JS_GAME.game = (function() {
    var connected = false;
    var disconnectMessage = "Unknown (could be unexpected server shutdown, internet outage, etc.)";
    var isKeyDown = [];
    var mx = 0;
    var my = 0;
    var mangle = 0;
    var sangle = 0;
    var mb = [false, false, false];
    var canvas;
    var renderer;
    var playerData = {
        name: "",
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        color: "#000000"
    };
    var entityNum = 0;
    var entities;
    var tilesWidth;
    var tilesHeight;
    var tiles;
    var singleTileWidth = 32; //MAGIC NUMBERS (i.e. 32 is width of tile image and draw)
    var frameLength = 1; // in milliseconds
    var gameIP = "167.88.120.57";
    var gamePort = "38734";
    var connectionInfo = "ws:" + gameIP + ":" + gamePort;
    var socket;
    var user = "";
    var pass = "";
    var windowWidth = $(window).innerWidth();
    var windowHeight = $(window).innerHeight();
    var textures = new Object();
    var errs = {
        100: "failedLogin"
    };

    function init() {
        document.body.scroll = "no"; // ie only

        pass = document.getElementById("loginInfo").pass.value;
        user = document.getElementById("loginInfo").user.value;
        address = document.getElementById("loginInfo").ip.value;
        if (user.indexOf(",") >= 0 || user.indexOf(":") >= 0) {
            document.getElementById("loginInfo").user.value = "INVALID INPUT";
            return;
        }
        if (address.length > 0) {
            if (address.indexOf("ws") != 0) {
                address = "ws:" + address;
            }
            if ((address.split(":").length - 1) < 2) {
                address = address + ":" + gamePort;
            }
            connectionInfo = address;
        }

        socket = new WebSocket(connectionInfo);

        socket.onopen = function() {
            connected = true;
            var ret = {
                "login": {
                    "user": user,
                    "pass": pass
                }
            };
            socket.send(JSON.stringify(ret));
        }

        socket.onmessage = function(message) {
            var msg = JSON.parse(message.data);
            if ("kicked" in msg) {
                connected = false;
                disconnectMessage = msg.kicked;
            }
            if ("err" in msg && msg.err in errs) {
                msg.err(); //I hope this works!
            }
            if ("validated" in msg) {
                if (msg.validated) {
                    gameInitialize();
                    gameLoop();
                }
            }
            if ("entities" in msg && "enum" in msg) {
                entities = msg.entities;
                entityNum = msg.enum;
            }
            if ("player" in msg) {
                playerData = msg.player;
            }
            if ("level" in msg) {
                tiles = msg.level.tiles;
                tilesWidth = msg.level.width;
                tilesHeight = msg.level.height;
            }
        };

        socket.onclose = function() {
            connected = false;
            $("body").empty();
            $('body').append('<h1>Disconnected</h1><br/><h2>Reason: ' + disconnectMessage);
        };

        socket.onerror = function() {

        };

        window.addEventListener("keydown", keyPress, false);
        window.addEventListener("keyup", keyRelease, false);

        $(window).resize(function() {
            windowWidth = $(window).innerWidth();
            windowHeight = $(window).innerHeight();
            canvasElement.attr({
                width: windowWidth,
                height: windowHeight,
            });
        });
    }

    function gameInitialize() {
        $("body").empty();

        clearInput();

        $('body').append('<canvas id="GameCanvas">');
        canvasElement = $('#GameCanvas');
        canvasElement.attr({
            width: windowWidth,
            height: windowHeight,
            tabIndex: 0,
            onblur: clearInput,
        }).focus();
        window.onblur = clearInput;

        canvas = canvasElement[0];

        renderer = new GRAPHICS.renderer(canvas);

        function getMousePos(canvas, evt) {
            var rect = canvas.getBoundingClientRect();
            return {
                x: Math.round((evt.clientX - rect.left) / (rect.right - rect.left) * canvas.width),
                y: Math.round((evt.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height)
            };
        }

        canvas.addEventListener("mousemove", function(evt) {
            var mousePos = getMousePos(canvas, evt);
            mx = Math.floor(mousePos.x + 0.49);
            my = Math.floor(mousePos.y + 0.49);
            mangle = -(Math.atan((my - (windowHeight / 2)) / (mx - (windowWidth / 2))) - ((mx >= (windowWidth / 2)) ? 0 : (Math.PI)));
            if (mangle < 0) {
                mangle += (Math.PI * 2);
            }
        }, false);

        canvas.addEventListener("mousedown", mouseClick, false);
        canvas.addEventListener("mouseup", mouseUnclick, false);
        renderer.webGLStart(drawLevel);
    }

    function drawLevel() {

        renderer.GL.useProgram(GRAPHICS.getShader("default"));

        renderer.GL.uniform2f(GRAPHICS.getShader("default").halfScreenUniform, canvas.width / 2, canvas.height / 2);
        renderer.GL.uniform2f(GRAPHICS.getShader("default").cameraUniform, 0, 0);

        renderer.getSprite("player").draw(GRAPHICS.getShader("default"), 0, 0);

        return;
        //draw Tiles
        for (a = 0; a < tilesWidth; a++) {
            for (b = 0; b < tilesHeight; b++) {
                if (tiles[a][b].id >= 0) {
                    drawImageSection("tilesheet", gPIVX(a * singleTileWidth), gPIVY(b * singleTileWidth), tiles[a][b].id, singleTileWidth, singleTileWidth);
                }
            }
        }
        //draw entities
        var entityNameOffsetY = 5;
        for (i = 0; i < entityNum; i++) {
            var e = entities[i];
            context.fillStyle = e.color;
            context.save();
            context.translate(gPIVX(e.x + (e.width / 2)), gPIVY(e.y + (e.height / 2)));
            context.rotate(e.angle);
            context.translate(-gPIVX(e.x + (e.width / 2)), -gPIVY(e.y + (e.height / 2)));
            //drawImageMasked("player", e.color, gPIVX(e.x), gPIVY(e.y), e.width, e.height);
            drawImage(e.state.type, gPIVX(e.x), gPIVY(e.y), e.width, e.height);
            if ("weapon" in e.state) {
                drawImage("dagger", gPIVX(e.x + e.state.weapon.x), gPIVY(e.y + e.state.weapon.y));
            }
            context.restore();
            var nameText = e.name + " (" + e.state.health + "/" + e.state.schematic.maxHealth + ")";
            context.fillText(nameText, (gPIVX(e.x) - (context.measureText(nameText).width / 2)) + (e.width / 2), gPIVY(e.y) - entityNameOffsetY);
        }
        context.fillText("Pos: (" + playerData.x + ", " + playerData.y + ")", 5, 15);

    }

    function gameLoop() {
        if (!connected) {
            return;
        }
        var keyData = "";
        try {
            var ret = {
                "keys": isKeyDown,
                "mouse": {
                    "button0": mb[0],
                    "button1": mb[1],
                    "button2": mb[2],
                    "angle": mangle,
                    "x": (mx - Math.floor(windowWidth / 2)),
                    "y": (my - Math.floor(windowHeight / 2))
                }
            };
            socket.send(JSON.stringify(ret));
        } catch (err) {}

        setTimeout(gameLoop, frameLength);
    }

    function gPIVX(x) {
        //getPositionInViewportX
        return ((x - (playerData.x + (playerData.width / 2))) + (windowWidth / 2));
    }

    function gPIVY(y) {
        //getPositionInViewportY
        return ((y - (playerData.y + (playerData.height / 2))) + (windowHeight / 2));
    }

    function gPIWX(x) {
        //getPositionInWorldX
        //inverse of gPIVX() (i.e. gPIWX(gPIVX(a)) == a)
        return ((x + (playerData.x + (playerData.width / 2))) - (windowWidth / 2));
    }

    function gPIWY(y) {
        //getPositionInWorldY
        //inverse of gPIVY() (i.e. gPIWY(gPIVY(a)) == a)
        return ((y + (playerData.y + (playerData.height / 2))) - (windowHeight / 2));
    }

    function clearInput() {
        for (i = 0; i < 256; i++) {
            isKeyDown[i] = false;
        }
    }

    function keyPress(e) {
        if (e.keyCode < 265) {
            e.preventDefault();
            isKeyDown[e.keyCode] = true;
        }
        return false;
    }

    function keyRelease(e) {
        if (e.keyCode < 265) {
            e.preventDefault();
            isKeyDown[e.keyCode] = false;
        }
    }

    function isKeyPressed(c) {
        return isKeyDown[c.charCodeAt(0)];
    }

    function mouseClick(e) {
        mb[e.button] = true
    }

    function mouseUnclick(e) {
        mb[e.button] = false;
    }

    function drawImageSection(name, x, y, id, spriteWidth, spriteHeight, xSize, ySize) {
        xSize = typeof xSize !== 'undefined' ? xSize : spriteWidth;
        ySize = typeof ySize !== 'undefined' ? ySize : spriteHeight;
        sheetCols = Math.floor(getImage(name).width / (spriteWidth + 2));
        sheetRows = Math.floor(getImage(name).height / (spriteHeight + 2));
        context.drawImage(getImage(name), ((id % sheetCols) * (spriteWidth + 2)) + 1, (Math.floor(id / sheetRows) * (spriteHeight + 2)) + 1, spriteWidth, spriteHeight, x, y, xSize, ySize);
    }

    function drawImage(name, x, y, xSize, ySize) {
        xSize = typeof xSize !== 'undefined' ? xSize : getImage(name).width;
        ySize = typeof ySize !== 'undefined' ? ySize : getImage(name).height;
        context.drawImage(getImage(name), x, y, xSize, ySize);
    }

    function drawImageMasked(name, color, x, y, xSize, ySize) {
        xSize = typeof xSize !== 'undefined' ? xSize : getImage(name).width;
        ySize = typeof ySize !== 'undefined' ? ySize : getImage(name).height;
        context.drawImage(getImageMasked(name, color), x, y, xSize, ySize);
    }

    function getImageData(image) {
        var tempCanv = document.createElement('canvas');
        tempCanv.width = image.width;
        tempCanv.height = image.height;
        var tempCTX = tempCanv.getContext('2d');
        tempCTX.drawImage(image, 0, 0, image.width, image.height);
        return tempCTX.getImageData(0, 0, image.width, image.height);
    }

    function getImageFromData(data) {
        var tempCanv = document.createElement('canvas');
        tempCanv.width = data.width;
        tempCanv.height = data.height;
        var tempCTX = tempCanv.getContext('2d');
        tempCTX.putImageData(data, 0, 0);
        var src = tempCanv.toDataURL("image/png");
        var img = new Image();
        img.src = src;
        return img;
    }

    function getImage(name) {
        if ((name) in textures) {
            return textures[name];
        } else {
            textures[name] = new Image;
            textures[name].src = 'res/tex/' + name + '.png';
            return textures[name];
        }
    }

    function getImageMasked(name, color) {
        if ((name + "-mask" + color) in textures) {
            return textures[name + "-mask" + color];
        }
        var image = getImage(name);
        var mask = getImage(name + "-mask");
        if (image.width == 0 || image.height == 0 || mask.width == 0 || mask.height == 0) {
            return new Image();
        }
        var maskData = getImageData(mask);
        var regex = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i;
        var colorRGBS = regex.exec(color);
        var colorRGB = [];
        for (i = 0; i < 3; i++) {
            colorRGB[i] = parseInt(colorRGBS[i + 1], 16);
        }
        for (i = 0; i < maskData.data.length; i += 4) {
            maskData.data[i] = colorRGB[0];
            maskData.data[i + 1] = colorRGB[1];
            maskData.data[i + 2] = colorRGB[2];
        }
        var tempCanv = document.createElement('canvas');
        tempCanv.width = image.width;
        tempCanv.height = image.height;
        var tempCTX = tempCanv.getContext("2d");
        tempCTX.drawImage(image, 0, 0, image.width, image.height);
        tempCTX.drawImage(getImageFromData(maskData), 0, 0, maskData.width, maskData.height);
        var ret = new Image();
        ret.src = tempCanv.toDataURL("image/png");
        textures[name + "-mask" + color] = ret;
        return ret;
    }


    function failedLogin() {
        alert("login failed"); //Just testing it out. I'll make it pretty later.
    }

    return {
        init: init,
        textures: textures
    };
})();

$(document).ready(function() {
    $("#loginInfo").submit(function(e) {
        e.preventDefault();
        JS_GAME.game.init();
        return false;
    });
});