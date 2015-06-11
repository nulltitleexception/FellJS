var JS_GAME = {};

JS_GAME.game = (function () {
  var isKeyDown = [];
  var context;
  var playerData = {name: "", x:0,y:0,width:0,height:0,color:"#000000"};
  var entityNum = 0;
  var entities;
  var tileWidth;
  var tiles;
  var frameLength = 1;// in milliseconds
  var socket;
  var connected = false;
  var user = "";
  var pass = "";
  var windowWidth = $(window).innerWidth();
  var windowHeight = $(window).innerHeight();
  var textures = new Object();


  function init() {
  	document.documentElement.style.overflow = 'hidden';  // firefox, chrome
    document.body.scroll = "no"; // ie only

    user = document.getElementById("loginInfo").user.value;
    pass = document.getElementById("loginInfo").pass.value;
    if (user.indexOf(",") >= 0 || user.indexOf(":") >= 0){
      document.getElementById("loginInfo").user.value = "INVALID INPUT";
      return;
    }

    socket = new WebSocket("ws:167.88.120.57:38734");

    socket.onopen = function() {
      connected = true;
      socket.send("login:" + user + "," + pass);
    };

    socket.onmessage = function(message) {
      	var msg = JSON.parse(message.data);
      	console.log(msg);
      	if ("entities" in msg && "enum" in msg){
      		entities = msg.entities;
      		entityNum = msg.enum;
      	}
      	if ("player" in msg){
      		playerData = msg.player;
      	}
      	if ("level" in msg){

      	}
    };

    socket.onclose = function() {
      window.location.reload(false); 
    };

    socket.onerror = function() {

    };

    $("body").empty();

    for (i = 0; i < 256; i++){
      isKeyDown[i] = false;
    }
    $('body').append('<canvas id="GameCanvas">');
    canvasElement = $('#GameCanvas');
    canvasElement.attr({
      width: windowWidth,
      height: windowHeight,
      tabIndex: 0,
      onblur: clearInput,
    }).focus();
    window.onblur = clearInput;

    var canvas = canvasElement[0];

    window.addEventListener( "keydown", keyPress, false);
    window.addEventListener( "keyup", keyRelease, false);
    context = canvas.getContext('2d');
    context.globalCompositeOperation = "normal";
    gameLoop();

    $(window).resize(function() {
      windowWidth = $(window).innerWidth();
      windowHeight = $(window).innerHeight();
      canvasElement.attr({
        width: windowWidth,
        height: windowHeight,
      });
    });
  }

  function gameLoop() {
    var keyData = "";
    for (i = 0; i < 256; i++){
      keyData += isKeyDown[i] ? 1 : 0;
    }
    try {
      socket.send("keys:" + keyData);
    } catch (err) {
    }
    context.clearRect(0, 0, windowWidth, windowHeight);
    context.fillStyle = "#FFFFFF"
    context.fillRect(0, 0, windowWidth, windowHeight);
    //draw BG
    for (a = -2; a < 3; a++){
    	for (b = -2; b < 3; b++){
    		drawImage("BG", , (gPIVX(0) % 1000) + (1000 * a), (gPIVY(0) % 1000) + (1000 * b), 1000, 1000);
    	}
    }
    //draw enemies
    for (i = 0; i < entityNum; i++){
      var e = entities[i];
      context.fillStyle = e.color;
      drawImageMasked("player", e.color, gPIVX(e.x), gPIVY(e.y), e.width, e.height);
      context.fillText(e.name,(gPIVX(e.x) - (context.measureText(e.name).width / 2)) + 15,gPIVY(e.y) - 5);
    }

    context.fillText("Pos: (" + playerData.x + ", " + playerData.y + ")",5,15);
    
    setTimeout(gameLoop, frameLength);
  }

  function gPIVX(x){
    //getPositionInViewportX
    return ((x - (playerData.x + (playerData.width / 2))) + (windowWidth / 2.0));
  }
  function gPIVY(y){
    //getPositionInViewportY
    return ((y - (playerData.y + (playerData.height / 2))) + (windowHeight / 2.0));
  }

  function clearInput(){
    for (i = 0; i < 256; i++){
      isKeyDown[i] = false;
    }
  }

  function keyPress(e){
    e.preventDefault();
    isKeyDown[e.keyCode] = true;
    return false;
  }
  function keyRelease(e){
    e.preventDefault();
    isKeyDown[e.keyCode] = false;
  }
  function isKeyPressed(c){
    return isKeyDown[c.charCodeAt(0)];
  }

  function drawImage(name, x, y, xSize, ySize){
  	xSize = typeof xSize !== 'undefined' ? xSize : getImage(name).width;
  	ySize = typeof ySize !== 'undefined' ? ySize : getImage(name).height;
  	context.drawImage(getImage(name), x, y, xSize, ySize);
  }
  function drawImageMasked(name, color, x, y, xSize, ySize){
  	xSize = typeof xSize !== 'undefined' ? xSize : getImage(name).width;
  	ySize = typeof ySize !== 'undefined' ? ySize : getImage(name).height;
  	context.drawImage(getImageMasked(name, color), x, y, xSize, ySize);
  }

  function getImageData(image){
    var tempCanv = document.createElement('canvas');
    tempCanv.width = image.width;
    tempCanv.height = image.height;
    var tempCTX = tempCanv.getContext('2d');
    tempCTX.drawImage(image, 0, 0, image.width, image.height);
    return tempCTX.getImageData(0, 0, image.width, image.height);
  }

  function getImageFromData(data){
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

  function getImage(name){
  	if ((name) in textures){
  		return textures[name];
  	} else {
  		textures[name] = new Image;
  		textures[name].src = '/assets/images/' + name + '.png';
  		return textures[name];
  	}
  }
  function getImageMasked(name, color){
  	if ((name + "-mask" + color) in textures){
  		return textures[name + "-mask" + color];
  	}
    var image = getImage(name);
    var mask = getImage(name + "-mask");
    if (image.width == 0 || image.height == 0 || mask.width == 0 || mask.height == 0){
      return new Image();
    }
    var maskData = getImageData(mask);
    var regex = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i;
    var colorRGBS = regex.exec(color);
    var colorRGB = [];
    for (i = 0; i < 3; i++){
      colorRGB[i] = parseInt(colorRGBS[i+1], 16);
    }
    for (i = 0; i < maskData.data.length; i+=4){
      maskData.data[i] =  colorRGB[0];
      maskData.data[i+1] =  colorRGB[1];
      maskData.data[i+2] =  colorRGB[2];
    }
    var tempCanv = document.createElement('canvas');
    tempCanv.width = image.width;
    tempCanv.height = image.height;
    var tempCTX=tempCanv.getContext("2d");
    tempCTX.drawImage(image,0,0,image.width, image.height);
    tempCTX.drawImage(getImageFromData(maskData),0,0,maskData.width, maskData.height);
    var ret = new Image();
    ret.src = tempCanv.toDataURL("image/png");
    textures[name + "-mask" + color] = ret;
    return ret;
  }


  return {
    init: init
  };
})();

$(document).ready(function() {
  $("#loginInfo").submit(function(e){
    e.preventDefault();
    JS_GAME.game.init();
    return false;
  });
});
