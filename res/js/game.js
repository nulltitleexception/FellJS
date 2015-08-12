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
                    //gameLoop();
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

    var drawTiming = Date.now();
    function drawLevel() {
        console.log("PreFrame: "+ (Date.now() - drawTiming) + "ms");
        drawTiming = Date.now();
        renderer.GL.useProgram(renderer.getShader("default"));

        renderer.GL.uniform2f(renderer.getShader("default").halfScreenUniform, canvas.width / 2, canvas.height / 2);
        renderer.GL.uniform2f(renderer.getShader("default").cameraUniform, playerData.x + (playerData.width / 2), playerData.y + (playerData.height / 2));

        //draw entities
        var entityNameOffsetY = 5;
        for (i = 0; i < entityNum; i++) {
            var e = entities[i];
            renderer.getSprite(e.state.type).draw(renderer.getShader("default"), e.x, e.y);
            if ("weapon" in e.state) {
                //TODO
                //drawImage("dagger", gPIVX(e.x + e.state.weapon.x), gPIVY(e.y + e.state.weapon.y));
            }
            var nameText = e.name + " (" + e.state.health + "/" + e.state.schematic.maxHealth + ")";
            //TODO
            //context.fillText(nameText, (gPIVX(e.x) - (context.measureText(nameText).width / 2)) + (e.width / 2), gPIVY(e.y) - entityNameOffsetY);
        }
        //draw Tiles
        for (a = 0; a < tilesWidth; a++) {
            for (b = 0; b < tilesHeight; b++) {
                if (tiles[a][b].id >= 0) {
                    //TODO
                    //drawImageSection("tilesheet", gPIVX(a * singleTileWidth), gPIVY(b * singleTileWidth), tiles[a][b].id, singleTileWidth, singleTileWidth);
                    renderer.getSprite("tile"+tiles[a][b].id).draw(renderer.getShader("default"), a * singleTileWidth, b * singleTileWidth);
                }
            }
        }
        //TODO OR REMOVE
        //context.fillText("Pos: (" + playerData.x + ", " + playerData.y + ")", 5, 15);

        console.log("During Frame: "+ (Date.now() - drawTiming) + "ms");
        drawTiming = Date.now();
        gameLoop();
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
        } catch (err) { console.log(err); }
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