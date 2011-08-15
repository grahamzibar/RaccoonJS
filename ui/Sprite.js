(function __Sprite__() {
	
	if (!window.ui) {
		ui = new Object();
	}
	
	ui.Sprite = function Sprite(obj, spriteDimensions, frameDimensions) {
		if (!obj) {
			throw 'No sprite container provided.';
			return;
		}
		if (!spriteDimensions || !frameDimensions) {
			// we assume it's the size of the obj being passed
			spriteDimensions = [obj.offsetWidth, obj.offsetHeight]; // We need these to be two differnet objects.
			frameDimensions = [[obj.offsetWidth, obj.offsetHeight]];
		}
		if (typeof frameDimensions[0] == 'number') {
			// This means we need to wrap our object inside an array
			frameDimensions = [frameDimensions];
		}
		// Bam!  Now, we do our magic!
		
		var timer;
		
		this.play = function() {
		};
		
		this.pasue = function() {
		};
	};
	
});