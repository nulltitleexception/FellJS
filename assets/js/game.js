var JS_GAME = {
  var isKeyDown = [];
  var context;
  var userData = [];
  var enemies = [];
  var enemyStride = 7;
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
      if (message.data.indexOf("pos") == 0){
        userData = message.data.split(":")[1].split(",");
        for (i = 0; i < 4; i++) {
          userData[i] = Number(userData[i])|0;
        }
      } else if (message.data.indexOf("dat") == 0){
        enemies = message.data.split(":")[1].split(",");
        enemyStride = Number(message.data.split(":")[0].replace("dat", ""));
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
      style: "width: " + windowWidth + "px; height: " + windowHeight + "px;",
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
      windowWidth = windowWidth / 2;
      windowHeight = windowHeight / 2;

      canvasElement.attr({
        width: windowWidth,
        height: windowHeight,
        style: "width: " + windowWidth + "px; height: " + windowHeight + "px;"
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
    		context.drawImage(getImage("BG"), (gPIVX(0) % 1000) + (1000 * a), (gPIVY(0) % 1000) + (1000 * b), 1000, 1000);
    	}
    }
    //draw enemies
    for (i = 0; i < enemies.length; i += enemyStride){
      context.fillStyle = enemies[i+4];
      context.drawImage(getImageMasked("player", enemies[i+4]),gPIVX(enemies[i]), gPIVY(enemies[i+1]), enemies[i+2], enemies[i+3]);
    }

    //draw enemy names
    for (i = 0; i < enemies.length; i += enemyStride){
      context.fillStyle = enemies[i+4];
      context.fillText(enemies[i+5],(gPIVX(enemies[i]) - (context.measureText(enemies[i+5]).width / 2)) + 15,gPIVY(enemies[i+1]) - 5);
    }

    //draw player name
    //context.fillStyle = userData[4];
    //context.font = "15px Arial";
    //context.fillText(userData[5],(gPIVX(userData[0]) - (context.measureText(userData[5]).width / 2)) + 15,gPIVY(userData[1]) - 5);
    
    setTimeout(gameLoop, frameLength);
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
