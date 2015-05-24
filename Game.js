var JS_GAME = {};

JS_GAME.game = (function () {
  var isKeyDown = [];
  var context;
  var xPosition = 0;
  var yPosition = 0;
  var enemies = [];
  var frameLength = 1;// in milliseconds
  var socket = new WebSocket("ws:25.117.117.69:38734");
  var connected = false;
 
socket.onopen = function() {
  connected = true;
};
 
socket.onmessage = function(message) {
  if (message.data.indexOf("pos") == 0){
  var regex = /pos:(\d+),(\d+)/;
  var pos = regex.exec(message.data);
  xPosition = pos[1];
  yPosition = pos[2];
  console.log(xPosition + ", " + yPosition);
} else if (message.data.indexOf("dat") == 0){
}
};
 
socket.onclose = function() {
};
 
socket.onerror = function() {
};

  function init() {
    for (i = 0; i < 256; i++){
      isKeyDown[i] = false;
    }
    $('body').append('<canvas id="GameCanvas">');
    var $canvas = $('#GameCanvas');
    $canvas.attr('width', $(window).width());
    $canvas.attr('height', $(window).height());
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


$(document).ready(function () {
  JS_GAME.game.init();
});