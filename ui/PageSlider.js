/*
	This is a control for having two containers waiting for content.  The pages are animated automagically.
	
	container1	- an element which is either positioned absolute or fixed.  Ensure top and left attributes are in pixels.
	container2	- must meet the same requirementy as above.
*/

ScriptLoader.requireScript('ui.PageSlider', 'extensions.DOMTweener', function() {
	if (!window.ui) {
		ui = new Object();
	}
	
	var PageSlider = ui.PageSlider = function PageSlider(container1, container2) {
		var __self__ = this;
		var containers = [container1, container2];
		
		this.duration = 1;
		this.targetZ = 1;
		
		var currentContainer = 0; // We use arguments here.
		var animating = false;
		
		container1.style.zIndex = this.targetZ;
		container2.style.visiblity = 'hidden';
		container2.style.zIndex = this.targetZ - 1;
		
		var reset = function(obj) {
			containers[currentContainer].style.zIndex = __self__.targetZ;
			obj.style.visibility = 'hidden';
			obj.style.zIndex = __self__.targetZ - 1;
			animating = false;
		};
		
		this.fade = function(obj) {
			obj.tween('opacity', {
				'to': 0,
				'duration': __self__.duration,
				'oncomplete': function() {
					reset(obj);
					obj.setStyle('opacity', 0);
				}
			});
		};
		
		this.verticalSlide = function(obj, direction) {
			obj.tween('top', {
				'to': (obj.offsetHeight + 60) * direction,
				'unit': 'px',
				'duration': __self__.duration,
				'oncomplete': function() {
					reset(obj);
					obj.style.top = '0px';
				}
			});
		};
		
		this.horizontalSlide = function(obj, direction) {
			obj.tween('left', {
				'to': (obj.offsetWidth + 60) * direction,
				'unit': 'px',
				'duration': __self__.duration,
				'oncomplete': function() {
					reset(obj);
					obj.style.left = '0px';
				}
			});
		};
		
		this.getContainer = function() {
			return containers[currentContainer];
		};
		
		this.otherContainer = function() {
			return arguments[currentContainer > 0 ? 0 : 1];
		};
		
		this.move = function(markup, direction, algorithmName) {
			if (animating) {
				return false;
			}
			if (!algorithmName) {
				algorithmName = 'horizontalSlide';
			}
			var oldIndex = currentContainer;
			currentContainer = currentContainer > 0 ? 0 : 1;
			animating = true;
			__self__.update(markup);
			__self__[algorithmName](containers[oldIndex], direction);
			return true;
		};
		
		this.update = function(markup) {
			var obj = containers[currentContainer];
			if (typeof markup == 'string') {
				obj.innerHTML = markup;
			} else {
				obj.innerHTML = '';
				obj.appendChild(markup);
			}
			//obj.setStyle('opacity', 100);
			obj.style.visibility = 'visible';
		};
		
	};
	PageSlider.GO_FORWARD = -1;
	PageSlider.GO_BACKWARD = 1;
});