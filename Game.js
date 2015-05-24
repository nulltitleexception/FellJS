var JS_GAME = {};

JS_GAME.game = (function () {
  var isKeyDown = [];
  var context;
  var xPosition = 0;
  var yPosition = 0;
  var frameLength = 1;// in milliseconds

  function init() {
    $('body').append('<canvas id="GameCanvas">');
    var $canvas = $('#GameCanvas');
    $canvas.attr('width', document.body.clientWidth);
    $canvas.attr('height', document.body.clientHeight);
    var canvas = $canvas[0];
    window.addEventListener( "keydown", keyPress, false);
    window.addEventListener( "keyup", keyRelease, false);
    context = canvas.getContext('2d');
    gameLoop();
  }

  function gameLoop() {
    if (isKeyPressed("W")) {
        yPosition--;
    }
    if (isKeyPressed("A")) {
        xPosition--;
    }
    if (isKeyPressed("S")) {
        yPosition++;
    }
    if (isKeyPressed("D")) {
        xPosition++;
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