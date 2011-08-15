/* Keyboard events! */
if (!window.events) {
	events = new Object();
}

ScriptLoader.requireScript('events.Keys', 'utils.Browser', function() {
	events.Keys = new Object();
	
	events.Keys.getCharCode = function(e) {
		if (e && e.which) {
			return e.which;
		}
		if (window.event) {
			e = window.event;
		}
		if (e.keyCode) {
			return e.keyCode;
		} else {
			return null;
		}
	};
	
	events.Keys.checkCharCode = function(e, val) {
		return events.Keys.getCharCode(e) == val;
	};
	
	events.Keys.isEnter = function(e) {
		return events.Keys.checkCharCode(e, 13);
	};
	
	events.Keys.getArrow = function(e) {
		var val = events.Keys.getCharCode(e);
		if (val == 37) {
			return 'left';
		} else if (val == 38) {
			return 'top';
		} else if (val == 39) {
			return 'right';
		} else if (val == 40) {
			return 'down';
		}
	};
	
	// Make specific ones too?  A plethora of these could exist.
	if (utils.Browser.isIE) {
		events.Keys.addKeyListener = function addKeyListener(callback) {
			document.attachEvent('onkeydown', callback.down);
			if (callback.up) {
				document.attachEvent('onkeydown', callback.up);
			}
		};
		
		events.Keys.removeKeyListener = function removeKeyListener(callback) {
			document.detachEvent('onkeydown', callback.down);
			if (callback.up) {
				document.detachEvent('onkeydown', callback.up);
			}
		};
	} else {
		events.Keys.addKeyListener = function addKeyListener(callback) {
			document.addEventListener('keydown', callback.down, false);
			if (callback.up) {
				document.addEventListener('keydown', callback.up, false);
			}
		};
		
		events.Keys.removeKeyListener = function removeKeyListener(callback) {
			document.removeEventListener('keydown', callback.down, false);
			if (callback.up) {
				document.removeEventListener('keydown', callback.up, false);
			}
		};
	}
	
	this.cleanUp = function() {
		/**/
	};
});