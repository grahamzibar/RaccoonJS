(function __MouseWheel_() {
	
	if (!window.extensions) {
		window.extensions = new Object();
	}
	
	extensions.MouseWheel = new (function() {
		var allWheels = new Array();
		
		this.convertEvent = function(e) {
			e = e ? e : window.event;
			e.wheelData = e.detail ? e.detail * -1 : e.wheelDelta / 40;
			return e; // Done!
		};
		
		this.cleanUp = function() {
			var length = allWheels.length;
			for (var i = 0; i < length; i++) {
				allWheels[i][0].removeWheel(allWheels[i][1]);
			}
			delete HTMLElement.prototype.addWheel;
			delete HTMLElement.prototype.removeWheel;
		};
		
		HTMLElement.prototype.addWheel = function(callback) {
			this.secretWheelIndex = allWheels.length;
			allWheels[this.secretWheelIndex] = [this, callback];
			if (this.addEventListener) {
				this.addEventListener('DOMMouseScroll', callback, false);
			} else if (this.attachEvent) {
				this.attachEvent('onmousewheel', callback);
			}
		};
		
		HTMLElement.prototype.removeWheel = function(callback) {
			allWheels.removeAt(this.secretWheelIndex);
			delete this.secretWheelIndex;
			if (this.removeEventListener) {
				this.removeEventListener('DOMMouseScroll', callback, false);
			} else if (this.detachEvent) {
				this.detachEvent('onmousewheel', callback);
			}
		};
	
	})();
	
})();