/* DomTweener */

if (!window.extensions) {
	extensions = new Object();
}

ScriptLoader.requireScript('extensions.DOMTweener', 'utils.Animations', 'extensions.Elements', function () {
	extensions.DOMTweemer = new (function DOMTweener() {
		var setup;
		var iterate;
		var complete;

		if (utils.Browser.isWebkit) {
			setup = complete = function (obj, property) {
				var webkitProperty = '';
				var transProperty = '';

				var webkitDuration = '';
				var transDuration = '';

				var webkitTiming = '';
				var transTiming = '';

				var allTweens = obj.tweens;
				for (var prop in allTweens) {
					webkitProperty += webkitProperty ? ', ' : '';
					webkitProperty += prop;
					transProperty += transProperty ? ', ' : '';
					transProperty += prop;

					webkitDuration += webkitDuration ? ', ' : '';
					webkitDuration += allTweens[prop].duration + 's';
					transDuration += transDuration ? ', ' : '';
					transDuration += allTweens[prop].duration + 's';

					webkitTiming += webkitTiming ? ', ' : '';
					webkitTiming += allTweens[prop].timingFunction;
					transTiming += transTiming ? ', ' : '';
					transTiming += allTweens[prop].timingFunction;

					// If we're dealing with opacity, it is passed as a number between 0 and 100... so we must divide by
					// 100 when applying the style
					obj.setStyle(prop, allTweens[prop].to + allTweens[prop].unit);
				}
				// If we have nothing, no need to set a style :)
				obj.style.WebkitTransitionProperty = webkitProperty;
				obj.style.transitionProperty = transProperty;

				obj.style.WebkitTransitionDuration = webkitDuration;
				obj.style.transitionDuration = transDuration;

				obj.style.WebkitTimingFunction = webkitTiming;
				obj.style.transitionTimingFunction = transTiming;
			};

			iterate = function () {
			};
		} else {
			setup = complete = function () {
			};

			iterate = function (obj, property) {
				var tweenObj = obj.tweens[property];
				obj.setStyle(property, tweenObj.current + tweenObj.unit); // Boom!
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

				var listenerOne = tweenObj.addEventListener('iterate', function () {
					var tweenObj = __obj__.tweens[property];
					// This is for IE only... it's weird!
					if (tweenObj.from <= tweenObj.to) {
						// Forwards
						if (tweenObj.current < tweenObj.from) {
							tweenObj.current = Math.min(tweenObj.to, tweenObj.from - tweenObj.current); // bring it back up.
						}
					} else if (tweenObj.current > tweenObj.from) {
						// Backwards
						tweenObj.current = Math.max(tweenObj.to, tweenObj.current - tweenObj.from);
					}
					iterate(__obj__, property);
				});
				var listenerTwo = tweenObj.addEventListener('complete', function () {
					tweenObj.removeEventListener(listenerOne);
					tweenObj.removeEventListener(listenerTwo);
					delete __obj__.tweens[property];
					tweenObj = null;
					complete(__obj__, property);
				});

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

		// Add support for cancelling/cleaning-up animations!

		this.cleanUp = function () {
			delete HTMLElement.prototype.tween;
		};

	})();
});