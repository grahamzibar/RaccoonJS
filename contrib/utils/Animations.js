if (!window.utils) {
	utils = new Object();
}
R.require('utils.Animations', 'utils.Timer', 'utils.Browser', function () {
	utils.Animations = new (function Animations() {
		var __self__ = this;
		this.DEFAULT_INTERVAL = utils.Browser.isIE ? 40 : 20; // 20 ms for each interval
		this.DEFAULT_SPEED = 200; // 200 units per SECOND
		
		this.splines = {
			'linear': [0, 0, 1, 1],
			'ease': [0.25, 0.1, 0.25, 1],
			'ease-in': [0.42, 0, 1, 1],
			'ease-out': [0, 0, 0.58, 1],
			'ease-in-out': [0.42, 0.0, 0.58, 1.0],
			'ease-out-in': [0.0, 0.42, 1.0, 0.58]
		};
		
		this.cubicBezier = function(startVal, endVal, timeProgress, timeDuration, cubics) {
			var cubicBezierAtTime = function (t, p1x, p1y, p2x, p2y, duration) {
				var ax = 0, bx = 0, cx = 0, ay = 0, by = 0, cy = 0;
				var sampleCurveX = function(t) { return ((ax * t + bx) * t + cx) * t; };
				var sampleCurveY = function(t) { return ((ay * t + by) * t + cy) * t; };
				var sampleCurveDerivativeX = function(t) { return (3.0 * ax * t + 2.0 * bx) * t + cx; };
				var solveEpsilon = function(duration) {
					return 1.0 / (200.0 * duration);
				};
				var solve = function(x, epsilon) {
					return sampleCurveY(solveCurveX(x, epsilon));
				};
				var solveCurveX = function(x, epsilon) {
					var t0, t1, t2, x2, d2, i;
					var fabs = function(n) {
						if (n >= 0)
							return n;
						else
							return 0 - n;
					};
					for (t2 = x, i = 0; i < 8; i++) {
						x2 = sampleCurveX(t2) - x;
						if (fabs(x2) < epsilon)
							return t2;
						d2 = sampleCurveDerivativeX(t2);
						if (fabs(d2) < 1e-6)
							break;
						t2 = t2 - x2 / d2;
					}
					t0 = 0.0; t1 = 1.0; t2 = x;
					if (t2 < t0)
						return t0;
					if (t2 > t1)
						return t1;
					while (t0 < t1) {
						x2 = sampleCurveX(t2);
						if (fabs(x2 - x) < epsilon)
							return t2;
						if (x > x2)
							t0 = t2;
						else
							t1 = t2;
						t2 = (t1 - t0) * 0.5 + t0;
					}
					return t2;
				};
				cx = 3.0 * p1x;
				bx = 3.0 * (p2x - p1x) - cx;
				ax = 1.0 - cx - bx;
				cy = 3.0 * p1y;
				by = 3.0 * (p2y - p1y) - cy;
				ay = 1.0 - cy - by;
				return solve(t, solveEpsilon(duration));
			};
			
			return Math.round((endVal - startVal) *
								cubicBezierAtTime(timeProgress / timeDuration, cubics[0], cubics[1], cubics[2], cubics[3], 1) +
								startVal);
		};
		this.Tweener = function Tweener(options) {
			var __home__ = this;
			this.inheritFrom = events.EventDispatcher;
			this.inheritFrom();
			delete this.inheritFrom;
			
			this.init = function(options) {
				var __this__ = __home__;
				__this__.from = options.from;
				__this__.to = options.to;
				__this__.current = options.from;
				__this__.progress = 0;
				__this__.duration = options.duration ?
									options.duration :
									Math.abs(options.to - options.from) / (__self__.DEFAULT_SPEED * (options.speed ? options.speed : 1));
				__this__.timingFunction = options.timingFunction ? options.timingFunction : 'ease';
				if (options.oniterate) {
					__this__.oniterate = options.oniterate;
				}
				if (options.oncomplete) {
					__this__.oncomplete = options.oncomplete;
				}
				if (options.ignore) {
					__this__.ignore = options.ignore;
				}
			};
			var timer = new utils.Timer(options.interval ? options.interval : __self__.DEFAULT_INTERVAL);
			timer.addEventListener('timer', function(e) {
				var __this__ = __home__;
				__this__.progress = e.progress / 1000;
				__this__.current = __self__.cubicBezier(__this__.from, __this__.to,
													__this__.progress, __this__.duration, __self__.splines[__this__.timingFunction]);
				if (__this__.oniterate) {
					__this__.oniterate();
				}
				__this__.dispatchEvent('iterate');
				if (__this__.progress >= __this__.duration || (__this__.current >= __this__.to - 2 && __this__.current <= __this__.to + 2)) {
					__this__.progress = __this__.duration;
					__this__.current = __this__.to;
					timer.stop();
					timer.removeEventListener(e.listener);
					timer = null;
					__this__.dispatchEvent('complete');
					if (__this__.oncomplete) {
						__this__.oncomplete();
					}
				}
				
				__this__ = null;
			});
			this.animate = function() {
				if (__home__.ignore) {
					__this__.progress = __this__.duration;
					__this__.current = __this__.to;
				}
				timer.start();
			};
			this.pause = function() {
				timer.stop();
			};
			this.init(options);
			options = null;
		};
	})();
});