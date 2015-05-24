var JS_GAME = {};

JS_GAME.game = (function () {
  var isKeyDown = [];
  var context;
  var userData = [];
  var enemies = [];
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

    $("#user").blur();
    $("#pass").blur();
    $("#loginInfo").blur().remove();

    socket = new WebSocket("ws:167.88.120.57:38734");

    socket.onopen = function() {
      connected = true;
      socket.send("login:" + user + "," + pass);
    };

socket.onmessage = function(message) {
  if (message.data.indexOf("pos") == 0){
  userData = message.data.split(":")[1].split(",");
    
} else if (message.data.indexOf("dat") == 0){
  enemies = message.data.split(":")[1].split(",");
}
};

socket.onclose = function() {
  window.location.reload(false); 
};

socket.onerror = function() {
};


document.body.innerHTML = "";
for (i = 0; i < 256; i++){
  isKeyDown[i] = false;
}
$('body').append('<canvas id="GameCanvas">');
var canvasElement = $('#GameCanvas');
canvasElement.attr('width', windowWidth);
canvasElement.attr('height', windowHeight);
canvasElement.attr('tabIndex', 0);
canvasElement.select().focus().click();

var canvas = canvasElement[0];

window.addEventListener( "keydown", keyPress, false);
window.addEventListener( "keyup", keyRelease, false);
context = canvas.getContext('2d');
gameLoop();
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
  for (i = 0; i < enemies.length; i += 4){
  context.fillStyle = enemies[i+2];
  context.fillRect(enemies[i], enemies[i+1], 30, 50);
  } 
  //draw player
  context.fillStyle = userData[2];
  context.fillRect(userData[0], userData[1], 30, 50);
  //draw enemy names
  for (i = 0; i < enemies.length; i += 4){
  context.fillStyle = enemies[i+2];
  context.fillText(enemies[i+3],(enemies[i] - (context.measureText(enemies[i+3]).width / 2)) + 15,enemies[i+1] - 5);
  }
  //draw player name
  context.fillStyle = userData[2];
  context.font = "15px Arial";
  context.fillText(userData[3],(userData[0] - (context.measureText(userData[3]).width / 2)) + 15,userData[1] - 5);
  
  setTimeout(gameLoop, frameLength);
}

function keyPress(e){
  isKeyDown[e.keyCode] = true;
  return false;
}
function keyRelease(e){
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
  $("#loginInfo").submit(function(event){
    event.preventDefault();
    JS_GAME.game.init();
    return false;
  });
});
