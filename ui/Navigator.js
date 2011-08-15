if (!window.ui) {
	ui = new Object()
}
var Navigator = ui.Navigator = function Navigator(contentArea, sections, axis, offset) {
	var __self__ = this;
	
	offset = offset ? offset : 0;
	
	if (!axis || axis == 'y') {
		axis = {
			'pos': 'posY'
		};
	} else if (axis == 'x') {
		axis = {
			'pos': 'posX'
		};
	}
	
	var lastClosest;
	
	this.update = function(callback) {
		var contentPos = contentArea.getXY()[axis.pos];
		var size = sections.length;
		var closest;
		for (var i = 0; i < size; i++) {
			var position = sections[i].getXY()[axis.pos] - contentPos;
			if (position <= offset) {
				closest = sections[i];
			} else {
				break;
			}
		}
		if (closest && closest != lastClosest) {
			lastClosest = closest;
			callback(closest);
		}
	};
};