/* Scroll Library :) */
// How should we expand upon this library?  Only one constructor, elements and properties/arguments are
// passed in groups of JSONs and whatever, and we can also make the content "draggable" if need be.  This
// might just be for touchstart and shizzles.
ScriptLoader.requireScript('ui.Scroll',
'events.Keys',
'events.Mouse',
'extensions.Elements',
'extensions.Document',
'extensions.DOMTweener',
function() {
	if (!window.ui) {
	    ui = new Object();
	}
	
	var Scroll = ui.Scroll = new Object();

	Scroll.ScrollPane = function ScrollPane(scrollMask, scrollContent, axis) {
		this.inheritFrom = events.EventDispatcher;
		this.inheritFrom();
		delete this.inheritFrom;

		var home = this;

		var point = '';
		var property = '';
		
		if (axis == 'x') {
			point = 'posX';
			axis = 'offsetWidth';
			property = 'left';
		} else {
			point = 'posY';
			axis = 'offsetHeight';
			property = 'top';
		}
		
		this.getAxis = function() {
			return point == 'posX' ? 'x' : 'y';
		};

		this.shiftToEl = function (el) {
			var coord = el.getXY()[point] - scrollMask.getXY()[point];
			if (coord < 0) {
				home.shiftByVal(coord);
			} else if ((coord + el[axis]) > scrollMask[axis]) {
				home.shiftByVal((coord + el[axis]) - scrollMask[axis]);
			}
			home.dispatchEvent('onshift', { 'percent': scrollContent.tweens[property].to /
			(scrollMask[axis] - scrollContent[axis] - 1) * 100 });
		};

		this.shiftToPercent = function (perc) {
			perc = Math.min(100, Math.max(0, perc));
			if (utils.Browser.isIE) {
				var pos = (scrollMask[axis] - scrollContent[axis] - 1) * (perc / 100);
				scrollContent.style[property] = pos + 'px';
			} else {
				scrollContent.tween(property, { 'to': (scrollMask[axis] - scrollContent[axis] - 1) * (perc / 100), 'unit': 'px', 'speed': 20});
			}
			home.dispatchEvent('onshift', { 'percent': perc });
		};

		this.shiftByVal = function (val) {
			var targ = Math.min(0, Math.max(scrollMask[axis] - scrollContent[axis] - 1, scrollContent.getStyleValue(property, 'px') - val));
			scrollContent.tween(property, { 'to': targ, 'unit': 'px', 'speed': 4});
			home.dispatchEvent('onshift', { 'percent': scrollContent.tweens[property].to / (scrollMask[axis] - scrollContent[axis] - 1) * 100 });
		};

		/* High Risk! */
		this.shiftToVal = function (val) {
			scrollContent.tween(property, { 'to': Math.min(0, Math.max(scrollMask[axis] - scrollContent[axis] - 1, val)), 'unit': 'px', 'speed': 20});
			home.dispatchEvent('onshift', { 'percent': scrollContent.tweens[property].to / (scrollMask[axis] - scrollContent[axis] - 1) * 100 });
		};

		this.getOffset = function () {
			return scrollContent.getStyleValue(property, 'px');
		};
	};

	
	Scroll.ScrollBar = function ScrollBar(knob, bar, scrollPane, axis) {
		var home = this;

		// INIT
		if (axis == 'x') {
			axis = { 'coord': 'posX', 'direction': 'left', 'dimension': 'offsetWidth' };
		} else {
			axis = { 'coord': 'posY', 'direction': 'top', 'dimension': 'offsetHeight' };
		}

		// PROPERTIES
		var difference = 0;
		var barPos = bar.getXY()[axis.coord];
		var barSize = bar[axis.dimension] - knob[axis.dimension];

		var keepUp = function (e) {
			knob.tween(axis.direction, { 'to' :barSize * (e.percent / 100), 'unit': 'px', 'speed': 30});
		};
		
		// MOVER
		var listener = scrollPane.addEventListener('onshift', keepUp); // :)

		// FUNCTIONS
		var trackMouse = function (e) {
			// get Mouse position relative to the scrollbar :)
			var newPos = Math.max(0, Math.min(barSize, document.getMouseXY(e)[axis.coord] - barPos - difference));
			scrollPane.shiftToPercent(newPos / barSize * 100);
			//scroller.setCurrentTarget(newPos);
			knob.style[axis.direction] = newPos + 'px';
		};

		var mouseDown = function (e) {
			if (listener) {
				scrollPane.removeEventListener(listener);
				listener = null;
			}
			if (!e.coord) {
				e['coord'] = document.getMouseXY(e)[axis.coord];
			}
			difference = e.coord - knob.getXY()[axis.coord];
			button.addMouseMove(trackMouse);
		};

		var mouseUp = function () {
			button.removeMouseMove();
			if (!listener) {
				listener = scrollPane.addEventListener('onshift', keepUp);
			}
		};

		// Events
		var button = new events.Mouse(knob);
		var track = new events.Mouse(bar);

		button.addMouseDown(mouseDown);
		button.addMouseUp(mouseUp);

		track.addMouseDown(function (e) {
			e['coord'] = document.getMouseXY(e)[axis.coord];
			var newPos = Math.max(0, Math.min(barSize, e['coord'] - barPos - (knob[axis.dimension] / 2)));
			//scroller.setFinalTarget(newPos);
			knob.tween(axis.direction, { 'to': newPos, 'unit': 'px', 'speed': 4});
			scrollPane.shiftToPercent(newPos / barSize * 100);
		});
	};


	Scroll.ScrollButton = function ScrollButton(obj, scrollPane, shiftAmount) {
		var arrow = new events.Mouse(obj);

		var staller = new utils.Timer(20);
		var scroller = null;
		
		var direction = shiftAmount > 0 ? (scrollPane.getAxis() == 'x' ? 'right' : 'down') : (scrollPane.getAxis() == 'x' ? 'left' : 'up');
		
		var mouseDown = function (e) {
			scrollPane.shiftByVal(shiftAmount);
			
			if (scroller) {
				staller.removeEventListener(scroller);
			}
			
			var stallCount = 0;
			scroller = staller.addEventListener('timer', function(e) {
				if (stallCount >= 30) {
					stallCount = 0;
					staller.removeEventListener(e.listener);
					scroller = staller.addEventListener('timer', function() {
						scrollPane.shiftByVal(shiftAmount);
					});
				} else {
					stallCount++;
				}
			});
			
			staller.start();
		};
		
		var mouseUp = function () {
			staller.stop();
			if (scroller) {
				staller.removeEventListener(scroller);
				scroller = null;
			}
		};
		
		arrow.addMouseDown(mouseDown);
		arrow.addMouseUp(mouseUp);
		events.Keys.addKeyListener({'down': function(e) {
			if (events.Keys.getArrow() == direction) {
				mouseDown(e);
			}
		}, 'up': mouseUp});
	};
	
	delete Scroll;
});