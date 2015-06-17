 function handleFileSelect(e) {
	stopDefault(e);

	var files = e.dataTransfer.files; // FileList object.

	// files is a FileList of File objects. List some properties.
	var output = [];
	for (var i = 0, f; f = files[i]; i++) {
		output.push('<li><strong>', escape(f.name), '</strong> (', f.type || 'n/a', ') - ',
								f.size, ' bytes, last modified: ',
								f.lastModifiedDate ? f.lastModifiedDate.toLocaleDateString() : 'n/a',
								'</li>');

		var reader = new FileReader();

		reader.onload = (function(theFile) {
			return function(e) {
		var img = new Image();
		img.src = e.target.result;
		JS_GAME.game.textures[theFile.name.replace(".png", "")] = img;
			};
		})(f);
		reader.readAsDataURL(f);
	}
	document.getElementById('list').innerHTML = '<ul>' + output.join('') + '</ul>';
}

function handleDragOver(e) {
	stopDefault(e);
	e.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
}

function handleDragEnter(e) {
	$("#wrapper").addClass("dragover");
	$("#wrapper").addClass("dragover").append("<div id='dragoverelement'><h3>Drop texture to use</h3></div>");
}

function handleDragLeave(e) {
	stopDefault(e);
	$("#dragoverelement").remove();
}

function stopDefault(e) {
	e.stopPropagation();
	e.preventDefault();
	$("#wrapper").removeClass("dragover");

}

// Setup the listeners.
$(document).ready(function() {
	var dropZone = $("#wrapper");
	dropZone.addEventListener('dragover', handleDragOver, false);
	dropZone.addEventListener('dragenter', handleDragEnter, false);
	dropZone.addEventListener('dragleave', handleDragLeave, false);
	dropZone.addEventListener('drop', handleFileSelect, false);
});
