ScriptLoader.requireScript('events.Mouse', 'events.EventDispatcher', 'utils.Browser', function () {
		var DocumentDispatch = new events.EventDispatcher();
	
		document.mouse_serial = 0;
		document.target = null;
		document.convertEvent = function (e) {
			if (!e) {
				e = window.event;
				if (e.srcElement) {
					e.target = e.srcElement;
				}
			}
			return e;
		};
	
		document.onmousedown = function (e) {
			e = document.convertEvent(e);
			if (e.target.mouse_noTouch && e.type == 'touchstart') {
				return;
			}
			var bool = DocumentDispatch.dispatchEvent(e.target.mouse_serial + 'onmousedown', e);
			if (bool) {
				//_openconsole.info('here!');
				document.target = e.target;
				// Cancel text selection
				document.body.focus();
				// prevent text selection in IE
				document.onselectstart = function () {
					return false;
				};
				// Stop image dragging
				e.target.ondragstart = function () {
					return false;
				};
				return false;
			}
		};
	
		document.onmouseup = function (e) {
			document.onselectstart = null;
			if (document.target != null) {
				document.target.ondragstart = null;
				e = document.convertEvent(e);
				e['realTarget'] = document.target;
				DocumentDispatch.dispatchEvent(document.target.mouse_serial + 'onmouseup', e);
				document.target = null;
			}
			//return false;
		};
		
		if (!utils.Browser.isIE) {
			document.addEventListener('touchstart', document.onmousedown, false);
			document.addEventListener('touchend', document.onmouseup, false);
		}
	
		events.Mouse = function Mouse(obj, noTouch) {
			noTouch = noTouch == undefined || noTouch == null ? false : noTouch;
			
			var home = this;
	
			var up;
			var down;
	
			obj.mouse_serial = document.mouse_serial++;
			obj.mouse_noTouch = noTouch;
	
			this.addMouseDown = function (FN) {
				down = DocumentDispatch.addEventListener(obj['mouse_serial'] + 'onmousedown', FN);
			};
	
			this.addMouseUp = function (FN) {
				up = DocumentDispatch.addEventListener(obj['mouse_serial'] + 'onmouseup', FN);
			};
			
			this.addMouseMove = function (FN) {
				if (!utils.Browser.isIE) {
					document.captureEvents(Event.MOUSEMOVE);
				}
				document.onmousemove = function (e) {
					e = document.convertEvent(e);
					FN(e);
					if (e.preventDefault)
						e.preventDefault();
				};
				if (!utils.Browser.isIE) {
					document.addEventListener('touchmove', document.onmousemove, false);
				}
			};
	
			this.removeMouseUp = function () {
				if (up) {
					DocumentDispatch.removeEventListener(up);
				}
			};
	
			this.removeMouseDown = function () {
				if (down) {
					DocumentDispatch.removeEventListener(down);
				}
			};
	
			this.removeMouseMove = function () {
				if (!utils.Browser.isIE) {
					document.removeEventListener('touchmove', document.onmousemove, false);
				}
				document.onmousemove = null;
			};
			//??
			obj.onclick = function () {
				return false;
			};
		};
		events.Mouse.cleanUp = function() {
			DocumentDispatch.killAllListeners();
			delete DocumentDispatch;
			delete document.mouse_serial;
			delete document.target;
			delete document.convertEvent;
			if (!utils.Browser.isIE) {
				document.removeEventListener('touchstart', document.onmousedown, false);
				document.removeEventListener('touchend', document.onmouseup, false);
				document.removeEventListener('touchmove', document.onmousemove, false);
			}
			document.onmousedown = document.onmouseup = document.onmousemove = null;
		};
});