var JS_GAME = {};

JS_GAME.game = (function () {
	var gameIP = "167.88.120.57";
	var gamePort = "38734";
	var connectionInfo = "ws:" + gameIP + ":" + gamePort;
	var socket;
	var user = "";
	var pass1 = "";
	var pass2 = "";
	
	function init() {
		user = document.getElementById("loginInfo").user.value;
		pass1 = document.getElementById("loginInfo").pass1.value;
		pass2 = document.getElementById("loginInfo").pass2.value;
		if (user.indexOf(",") >= 0 || user.indexOf(":") >= 0){
			document.getElementById("loginInfo").user.value = "INVALID INPUT";
			return;
		}
		if (pass1 != pass2){
			document.getElementById("loginInfo").pass1.value = "PASSWORDS DO NOT MATCH";
			return;
		}
		socket = new WebSocket(connectionInfo);

		socket.onopen = function() {
			connected = true;
			var ret = {"add": {
				 	"user": user,
				 	"pass": pass
				}
			};
			socket.send("add:" + user + "," + pass1);
		};
		socket.onmessage = function(message) {
			if (message.data.indexOf("valid") == 0){
				window.location.href = "http://monolc.com/FellJS";
			} else {
				document.getElementById("loginInfo").pass1.value = "Creating Failed";
			}
		};
		socket.onclose = function() {
			window.location.reload(false);
		};
		socket.onerror = function() {

		};
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