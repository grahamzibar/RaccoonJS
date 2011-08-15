/* Scroll v2.0 */
ScriptLoader.requireScript('ui.ScrollPane',
'events.Mouse', 'extensions.Document', 'extensions.DOMTweener',
function () {
	if (!window.ui) {
		ui = new Object();
	}
	
	var MIN_KNOB_WIDTH = 40; // This should be moved as an editable feature?
	var SCROLL_SPEED = 12;
	
	var disabled = false;
	
	// Mask is the element which wraps the content and hides it from view.
	// container is the element which holds all of our content and will be the one moving around.
	// axis is the direction of scrolling (etiher x or y... should be deprecated and self-detected in the future) x is default.
	// Draggable is whether or not we are able to drag the content with our finger/mouse.
	// Scrollparts is as follows:
	// {
	//	scrollbar: {
	//		bar: obj1,
	//		knob: obj2
	//	},
	//	arrows: {
	//		up: obj3,
	//		down: obj4,
	//		increment: number
	//	},
	//	alwaysVisible: boolean // false if visible only on mouse over or dragging
	// }
	var ScrollPane = ui.ScrollPane = function ScrollPane(mask, container, draggable, axis, scrollparts) {
		var __self__ = this;
		
		this.inheritFrom = events.EventDispatcher;
		this.inheritFrom();
		delete this.inheritFrom;
		
		// everytime we scroll, we ask for all the dimensions and go forth.
		// everytime the page is resized, we ask for these values as well.
		if (!axis || axis == 'x') {
			axis = {
				'dimension': 'offsetWidth',
				'pos': 'posX',
				'style': 'width',
				'offset': 'left'
			};
		} else {
			axis = {
				'dimension': 'offsetHeight',
				'pos': 'posY',
				'style': 'height',
				'offset': 'top'
			};
		}

		var cache = {};
		
		this.disable = function() {
			disabled = true;
		};
		
		this.enable = function() {
			disabled = false;
		};

		// When we begin or have some events that requires recalibration.  This caches everything
		this.calibrate = function () {
			cache.maskSize = mask[axis.dimension];
			cache.maskPos = mask.getXY()[axis.pos];
			cache.contentSize = container[axis.dimension];
			cache.contentPos = container.getXY()[axis.pos] - mask.getXY()[axis.pos];
			if (scrollparts && scrollparts.scrollbar) {
				var perc = cache.maskSize / cache.contentSize;
				if (perc >= 1) {
					// We have less content than mask room, so we need to hide the scrollbar :)
					cache.barSize = cache.knobSize = cache.knobPos = cache.barPos = false;
					scrollparts.scrollbar.knob.tween(axis.style, { 'to': scrollparts.scrollbar.bar.offsetWidth, 'unit': 'px', 'speed': SCROLL_SPEED });
					scrollparts.scrollbar.knob.tween(axis.offset, { 'to': 0, 'unit': 'px', 'speed': SCROLL_SPEED });
				} else {
					cache.barSize = scrollparts.scrollbar.bar[axis.dimension];
					if (scrollparts.scrollbar.allowResizing !== false) {
						cache.knobSize = Math.round(Math.max(MIN_KNOB_WIDTH, cache.barSize * perc));
					} else {
						cache.knobSize = scrollparts.scrollbar.knob.getStyleValue('width', 'px');
					}
					scrollparts.scrollbar.knob.tween(axis.style, { 'to': cache.knobSize, 'unit': 'px', 'speed': SCROLL_SPEED });
					cache.knobPos = scrollparts.scrollbar.knob.getXY()[axis.pos];
					cache.barPos = scrollparts.scrollbar.bar.getXY()[axis.pos];
					// Here, we check if the knob still fits in the bar...
					var diff = cache.knobPos + cache.knobSize - cache.barSize;
					if (diff > 0) {
						cache.knobPos -= diff;
						scrollparts.scrollbar.knob.tween(axis.offset, { 'to': cache.knobPos, 'unit': 'px', 'speed': SCROLL_SPEED });
					}
				}
			}
		};

		this.scrollBy = function (val) {
			if (disabled) {
				return;
			}
			var diff = cache.maskSize - cache.contentSize;
			cache.contentPos = Math.max(diff, Math.min(0, cache.contentPos - val));
			container.style[axis.offset] = cache.contentPos + 'px';
			//container.tween(axis.offset, { 'to': cache.contentPos, 'unit': 'px', 'speed': SCROLL_SPEED * 4, 'timingFunction': 'ease-out' });
			__self__.dispatchEvent('scroll', { 'percent': cache.contentPos / diff });
			__self__.dispatchEvent('completeScroll', { 'percent': cache.contentPos / diff });
		};

		this.scrollTo = function (val) {
			if (disabled) {
				return;
			}
			val *= -1;
			var diff = cache.maskSize - cache.contentSize;
			cache.contentPos = Math.max(diff, Math.min(0, val));
			
			if (Math.abs(cache.contentPos - container.getStyleValue(axis.offset, 'px')) < 200) {
				container.style[axis.offset] = cache.contentPos + 'px';
				__self__.dispatchEvent('scroll', { 'percent': cache.contentPos / diff });
				__self__.dispatchEvent('completeScroll', { 'percent': cache.contentPos / diff });
			} else {
				container.tween(axis.offset, { 'to': cache.contentPos, 'unit': 'px', 'speed': SCROLL_SPEED, 'timingFunction': 'ease-out',
				'oncomplete': function() {
					__self__.dispatchEvent('completeScroll', { 'percent': cache.contentPos / diff });
				} });
				__self__.dispatchEvent('scroll', { 'percent': cache.contentPos / diff });
			}
		};

		this.scrollToPercent = function (perc) {
			if (disabled) {
				return;
			}
			__self__.scrollTo(perc / 100 * (cache.contentSize - cache.maskSize));
		};

		var init = function () {
			__self__.calibrate();
			events.addHandler(window, 'onresize', __self__.calibrate);
			if (scrollparts) {
				/*if (scrollparts.alwaysVisible === false) {
					__self__.addEventListener('scroll', function () {
						scrollparts.scrollbar.bar.tween('opacity', { 'to': 100, 'speed': 1 });
					});
					__self__.addEventListener('complete', function () {
						scrollparts.scrollbar.bar.tween('opacity', { 'to': 0, 'speed': 1 });
					});
					events.addHandler(mask, 'onmouseover', function () {
						scrollparts.scrollbar.bar.tween('opacity', { 'to': 100, 'speed': 1 });
					});
					events.addHandler(mask, 'onmouseout', function () {
						scrollparts.scrollbar.bar.tween('opacity', { 'to': 0, 'speed': 1 });
					});
				}*/
				if (scrollparts.scrollbar) {
					var knob = scrollparts.scrollbar.knob;
					var button = new events.Mouse(knob);
					var track = new events.Mouse(scrollparts.scrollbar.bar);
					
					var keepUp = function(e) {
						cache.knobPos = e.percent * (cache.barSize - cache.knobSize);
						knob.tween(axis.offset,
						{'to': cache.knobPos, 'unit': 'px', 'speed': SCROLL_SPEED, 'timingFunction': 'ease-out'});
					};
					var listener = __self__.addEventListener('scroll', keepUp);
					
					var difference = 0;
					
					var trackMouse = function (e) {
						var newPos = document.getMouseXY(e)[axis.pos];
						var change = newPos - difference;
						difference = newPos;
						delete newPos;
						cache.knobPos += change;
						delete change;
						var diff = cache.barSize - cache.knobSize;
						cache.knobPos = cache.knobPos >= diff ? diff : (cache.knobPos < 0 ? 0 : cache.knobPos);
						__self__.scrollToPercent(cache.knobPos / diff * 100);
						delete diff;
						knob.style[axis.offset] = cache.knobPos + 'px';
					};
			
					var mouseDown = function (e) {
						difference = document.getMouseXY(e)[axis.pos];
						__self__.removeEventListener(listener);
						listener = null;
						button.addMouseMove(trackMouse);
					};
			
					var mouseUp = function () {
						button.removeMouseMove();
						listener = __self__.addEventListener('scroll', keepUp);
					};
			
					button.addMouseDown(mouseDown);
					button.addMouseUp(mouseUp);
			
					track.addMouseDown(function(e) {
						var diff = cache.barSize - cache.knobSize;
						__self__.scrollToPercent(Math.min(diff, Math.max(0, document.getMouseXY(e)[axis.pos] - cache.barPos - (cache.knobSize / 2))) / diff * 100);
					});
				}
				if (scrollparts.arrows) {
					var increment = scrollparts.arrows.increment;
					var upBtn = new events.Mouse(scrollparts.arrows.up);
					var downBtn = new events.Mouse(scrollparts.arrows.down);
					
					var timer = new utils.Timer(100);
					var starter = false;
					var timeListener = false;
					
					var clearTimer = function() {
						timer.stop();
						if (starter) {
							clearTimeout(starter);
							starter = false;
						}
						if (timeListener) {
							timer.removeEventListener(timeListener);
							timerListener = false;
						}
					};
					
					var upScroll = function(e) {
						__self__.scrollBy(!e ? -increment : -increment / 2);
					};
					
					var downScroll = function(e) {
						__self__.scrollBy(!e ? increment : increment / 2);
					};
					
					upBtn.addMouseDown(function() {
						upScroll();
						
						starter = setTimeout(function() {
							clearTimeout(starter);
							starter = false;
							timeListener = timer.addEventListener('timer', upScroll);
							timer.start();
						}, 500);
					});
					downBtn.addMouseDown(function() {
						downScroll();
						
						starter = setTimeout(function() {
							clearTimeout(starter);
							starter = false;
							timeListener = timer.addEventListener('timer', downScroll);
							timer.start();
						}, 500);
					});
					upBtn.addMouseUp(clearTimer);
					downBtn.addMouseUp(clearTimer);
				}
			}
			if (draggable) {
				//var dragger = new events.Mouse(container, true);
				// We take the distance swiped divided by the time it took to swipe it and get a speed.  Speed
				// determines how much we can swipe by.  1 speed = 100 pixels?  That will need to be determined.
				var lastMousePos = 0;
				var lastStamp = 0;
				
				var mouseMove = function(e) {
					if (disabled) {
						return;
					}
					var newPos = document.getMouseXY(e)[axis.pos];
					var newStamp = (new Date()).getTime();
					__self__.scrollBy(-(newPos - lastMousePos) / (newStamp - lastStamp) * 100);
					
					lastMousePos = newPos;
					lastStamp = newStamp;
				};
				
				var mouseDown = function(e) {
					if (disabled) {
						return;
					}
					lastMousePos = document.getMouseXY(e)[axis.pos];
					lastStamp = (new Date()).getTime();
					dragger.addMouseMove(mouseMove);
				};
				
				var touchDown = function(e) {
					if (disabled) {
						return;
					}
					lastMousePos = document.getMouseXY(e)[axis.pos];
					lastStamp = (new Date()).getTime();
					container.addEventListener('touchmove', mouseMove, false);
				};
				
				var mouseUp = function(e) {
					dragger.removeMouseMove();
					mouseMove(e);
				};
				
				var touchUp = function(e) {
					container.removeEventListener('touchmove', mouseMove, false);
					mouseMove(e);
				};
				
				if (!utils.Browser.isIE) {
					container.addEventListener('touchstart', touchDown, false);
					container.addEventListener('touchend', touchUp, false);
				}
				//dragger.addMouseDown(mouseDown);
				//dragger.addMouseUp(mouseUp);
			}
		};

		init();
	};
});