var JS_GAME = {};

JS_GAME.game = (function () {
  var time = 5000;
  var dt = 2500;
  var context;
  var windowWidth = $(window).innerWidth();
  var windowHeight = $(window).innerHeight();
  var planets = [];
  var planetsBACKUP = [];
  var colors = ["#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#FF00FF", "#00FFFF", "#000000"];

  function resetPlanets(){
  	planets[0] = {x: 400, y: 400, vx: 100, vy: 60, m: 10};
  	planets[1] = {x: 30, y: 40, vx: 200, vy: 0, m: 20};
  }

  function getAccel(x, y, ni){
  	var ret = {x: 0, y: 0};
  	for (p = 0; p < planets.length; p++){
  		if (p != ni){
  			var m = (planets[p].m * 1000000);
  			var l = getLengthSQ(x - planets[p].x, y - planets[p].y);
  			var ax = (planets[p].x - x) / getLength(x - planets[p].x, y - planets[p].y);
  			var ay = (planets[p].y - y) / getLength(x - planets[p].x, y - planets[p].y);
  			ret.x += ax * (m / l);
  			ret.y += ay * (m / l);
  			console.log(ret.x + "," + ret.y);
  		}
  	}
  	return ret;
  }

  function getLengthSQ(x,y){
  	return ((x * x) + (y * y));
  }
  function getLength(x,y){
  	return Math.sqrt(getLengthSQ(x,y));
  }

  function init() {
    $("body").empty();
    resetPlanets();

    $('body').append('<canvas id="GameCanvas">');
    canvasElement = $('#GameCanvas');
    canvasElement.attr({
      width: windowWidth,
      height: windowHeight,
      tabIndex: 0,
    }).focus();

    var canvas = canvasElement[0];
    context = canvas.getContext('2d');

    gameLoop(0);

    $(window).resize(function() {
      windowWidth = $(window).innerWidth();
      windowHeight = $(window).innerHeight();

      canvasElement.attr({
        width: windowWidth,
        height: windowHeight
      });
    });
  }

  function gameLoop(num) {
    context.clearRect(0, 0, windowWidth, windowHeight);
    for (i = 0; i < planets.length; i++){
    	context.fillStyle = colors[i];
    	context.beginPath();
    	context.arc(planets[i].x, planets[i].y, planets[i].m, 0, 2 * Math.PI, false);
    	context.fill();
    	planets[i].x += planets[i].vx * (dt / 1000.0);
    	planets[i].y += planets[i].vy * (dt / 1000.0);
    	var accel = getAccel(planets[i].x, planets[i].y, i);
    	planets[i].vx += accel.x * (dt / 1000.0);
    	planets[i].vy += accel.y * (dt / 1000.0);
	}
	if (num <= time){
    	setTimeout(function(){ gameLoop(num+dt); }, dt);
	}
	else {
		resetPlanets();
		dt /= 2.0;
    	setTimeout(function(){ gameLoop(0); }, dt);
	}
  }

  return {
    init: init
  };
})();