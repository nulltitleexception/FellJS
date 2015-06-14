 function handleFileSelect(evt) {
	evt.stopPropagation();
	evt.preventDefault();

	var files = evt.dataTransfer.files; // FileList object.

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

function handleDragOver(evt) {
	evt.stopPropagation();
	evt.preventDefault();
	evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
}

// Setup the dnd listeners.
$(document).ready(function() {
	var dropZone = document.getElementById('drop_zone');
	dropZone.addEventListener('dragover', handleDragOver, false);
	dropZone.addEventListener('drop', handleFileSelect, false);
});
