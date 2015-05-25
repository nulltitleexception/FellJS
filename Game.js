var JS_GAME = {};

JS_GAME.game = (function () {
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


  function init() {
   
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
          userData[i] = Number(userData[i]);
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
      tabIndex: 0,
    }).focus();

    var canvas = canvasElement[0];

    window.addEventListener( "keydown", keyPress, false);
    window.addEventListener( "keyup", keyRelease, false);
    context = canvas.getContext('2d');
    gameLoop();

    $(window).resize(function() {
      windowWidth = $(window).innerWidth();
      windowHeight = $(window).innerHeight();

      canvasElement.attr({
        width: windowWidth,
        height: windowHeight
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

    //draw enemies
    for (i = 0; i < enemies.length; i += enemyStride){
      context.fillStyle = enemies[i+4];
      context.fillRect(gPIVX(enemies[i]), gPIVY(enemies[i+1]), enemies[i+2], enemies[i+3]);
    } 

    //draw player
    context.fillStyle = userData[4];
    context.fillRect(gPIVX(userData[0]), gPIVY(userData[1]), userData[2], userData[3]);

    //draw enemy names
    for (i = 0; i < enemies.length; i += enemyStride){
      context.fillStyle = enemies[i+4];
      context.fillText(enemies[i+5],(gPIVX(enemies[i]) - (context.measureText(enemies[i+5]).width / 2)) + 15,gPIVY(enemies[i+1]) - 5);
    }

    //draw player name
    context.fillStyle = userData[4];
    context.font = "15px Arial";
    context.fillText(userData[5],(gPIVX(userData[0]) - (context.measureText(userData[5]).width / 2)) + 15,gPIVY(userData[1]) - 5);
    
    setTimeout(gameLoop, frameLength);
  }

  function gPIVX(x){
    //getPositionInViewportX
    var ret = new Object();
    return ((x - (userData[0] + userData[2])) + (windowWidth / 2.0));
  }
  function gPIVY(y){
    //getPositionInViewportY
    return ((y - (userData[1] + userData[3])) + (windowHeight / 2.0));
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
