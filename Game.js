var JS_GAME = {};

JS_GAME.game = (function () {
  var isKeyDown = [];
  var context;
  var xPosition = 0;
  var yPosition = 0;
  var enemies = [];
  var frameLength = 1;// in milliseconds
  var socket;
  var connected = false;
  var user = "";
  var pass = "";

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
    var regex = /pos:(\d+),(\d+)/;
    var pos = regex.exec(message.data);
    xPosition = pos[1];
    yPosition = pos[2];
  //console.log(xPosition + ", " + yPosition);
} else if (message.data.indexOf("dat") == 0){
  var splitted = message.data.split(":")[1].split(",");
  enemies = [];
  for (i = 0; i < splitted.length; i++){
    enemies[i] = splitted[i];
  }
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
var $canvas = $('#GameCanvas');
$canvas.attr('width', $(window).innerWidth());
$canvas.attr('height', $(window).innerHeight());
var canvas = $canvas[0];
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
  context.clearRect(0, 0, document.body.clientWidth, document.body.clientHeight);
  context.fillStyle = '#fe57a1';
  context.fillRect(xPosition, yPosition, 30, 50);
  context.font = "15px Arial";
  context.fillText(user,(xPosition - (context.measureText(user).width / 2)) + 15,yPosition - 5);
  context.fillStyle = '#a157fe';
  for (i = 0; i < enemies.length; i += 3){
    context.fillRect(enemies[i], enemies[i+1], 30, 50);
  context.fillText(enemies[i+2],enemies[i] - (context.measureText(enemies[i+2]).width / 2)) + 15,enemies[i+1] - 5);
  }
  setTimeout(gameLoop, frameLength);
}

function keyPress(e){
  isKeyDown[e.keyCode] = true;
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
  $( "#loginInfo" ).submit(function(event){
    event.preventDefault();
    JS_GAME.game.init();
  });
});
