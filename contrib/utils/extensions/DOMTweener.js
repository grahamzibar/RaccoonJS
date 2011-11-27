R.require('utils.extensions.DOMTweener',
'utils.Animations',
'utils.extensions.HTMLElement',
function () {
	utils.extensions.DOMTweemer = new (function DOMTweener() {
		var setup;
		var iterate;
		var complete;

		if (utils.Browser.isWebkit) {
			setup = complete = function (obj, property) {
				
				var transition = '';
				var counter = false;
				var allTweens = obj.tweens;
				for (var prop in allTweens) {
				
					transition += counter ? ', ' : '';
					transition += prop;
					transition += ' ';
					transition += allTweens[prop].duration;
					transition += 's ';
					transition += allTweens[prop].timingFunction;
					transition += ' 0';
					
					obj.setStyle(prop, allTweens[prop].to + allTweens[prop].unit);
					counter = true;
				}
				obj.style.transition = obj.style.WebkitTransition = transition;
			};

			iterate = function () {
			};
		} else {
			setup = complete = function () {
			};

			iterate = function (obj, property) {
				var tweenObj = obj.tweens[property];
				obj.setStyle(property, tweenObj.current + tweenObj.unit);
			};
		}

		/* 
		property - The name of the attribute you wish to animate
		options -
		to - the target
		unit - (required only if unit is required for CSS property)
		duration/speed - (optional) - duration is in SECONDS, and speed a decimal percent (1 = 100%, 2 = 200%, 0.5, = 50%, etc..)
		timingFunction - (optional) - any cubic bezier splining name (linear, ease (default), ease-in, etc..)
		*/
		HTMLElement.prototype.tween = function (property, options) {
			var __obj__ = this;

			if (!this.tweens) {
				this.tweens = new Object();
			}

			options.from = this.getStyleValue(property, options.unit);
			
			if (!options.from && options.from != 0) {
				if (this[property]) {
					options.from = this[property];
				} else {
					options.from = 0;
				}
			}
			
			if (!this.tweens[property]) {
				var tweenObj = this.tweens[property] = new utils.Animations.Tweener(options);

				tweenObj.unit = options.unit ? options.unit : '';
				setup(__obj__, property);

				if (utils.Browser.isWebkit) {
					__obj__.addEventListener('webkitTransitionEnd', function anon() {
						__obj__.removeEventListener('webkitTransitionEnd', anon, false);
						tweenObj = null;
						complete(__obj__, property);
					}, false);
				} else {
					var listenerOne = tweenObj.addEventListener('iterate', function () {
						var tweenObj = __obj__.tweens[property];
						if (tweenObj.from <= tweenObj.to) {
							if (tweenObj.current < tweenObj.from) {
								tweenObj.current = Math.min(tweenObj.to, tweenObj.from - tweenObj.current);
							}
						} else if (tweenObj.current > tweenObj.from) {
							tweenObj.current = Math.max(tweenObj.to, tweenObj.current - tweenObj.from);
						}
						iterate(__obj__, property);
					});
					
					var listenerTwo = tweenObj.addEventListener('complete', function () {
						tweenObj.removeEventListener(listenerOne);
						tweenObj.removeEventListener(listenerTwo);
						delete __obj__.tweens[property];
						delete listenerOne;
						delete listenerTwo;
						tweenObj = null;
						complete(__obj__, property);
					});
				}

				tweenObj.animate();
				return tweenObj;
			}
			var tweenObj = this.tweens[property];
			tweenObj.pause();
			tweenObj.init(options);

			tweenObj.unit = options.unit ? options.unit : '';
			setup(__obj__, property);

			tweenObj.animate();
			return tweenObj;
		};

		this.dispose = function () {
			delete HTMLElement.prototype.tween;
		};
	})();
});