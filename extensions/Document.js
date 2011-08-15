if (!window.extensions) {
	extensions = new Object();
}

extensions.Document = new (function() {
	
	document.getMouseXY = function(e) {
	    var posX = 0;
	    var posY = 0;
	
	    if (!e) {
	        e = window.event;
	    }
	    if (e.pageX || e.pageY) {
	        posX = e.pageX;
	        posY = e.pageY;
	    } else if (e.clientX || e.clientY) {
	        posX = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
	        posY = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
	    } else if (e.targetTouches) {
	    	posX = event.targetTouches[0].pageX;
	    	posY = event.targetTouches[0].pageY;
	    } else {
	        alert("Your browser does not support optaining cursor coordinates...\nPlease update your browser.\nK THNX BAI LOLZ!!!1!!ONE!");
	    }
	    return { 'posX': posX, 'posY': posY };
	};

	document.getViewport = function () {
		var width = 0;
		var height = 0;
	
		// IE
		if (!window.innerWidth) {
			if (document.documentElement.clientWidth) {
				// strict
				width = document.documentElement.clientWidth;
				height = document.documentElement.clientHeight;
			} else {
				// quirks
				width = document.body.clientWidth;
				height = document.body.clientHeight;
			}
		} else {
			// W3C standard
			width = window.innerWidth;
			height = window.innerHeight;
		}
		return { 'width': width, 'height': height }; // we could add more, eh?
	};

	document.getPageOffset = function () {
		var offsetX = 0;
		var offsetY = 0;
	
		// IE
		if (!window.pageYOffset) {
			if (document.documentElement.scrollTop) {
				// Strict
				offsetX = document.documentElement.scrollLeft;
				offsetY = document.documentElement.scrollTop;
			} else {
				// Quirks
				offsetX = document.body.scrollLeft;
				offsetY = document.body.scrollTop;
			}
		} else {
			// W3C
			offsetX = window.pageXOffset;
			offsetY = window.pageYOffset;
		}
		return {'posX':offsetX, 'posY':offsetY};
	};

	document.getCenter = function (dimensions, ignoreOffset) {
		if (!dimensions) {
			dimensions = { 'width': 0, 'height': 0 };
		}
	
		var offset = ignoreOffset ? { 'posY': 0, 'posX': 0 } : document.getPageOffset();
		var size = document.getViewport();
	
		return { 'posX': (size.width / 2 - dimensions.width / 2) + offset.posX, 'posY': (size.height / 2 - dimensions.height / 2) + offset.posY };
	};
})();