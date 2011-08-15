ScriptLoader.requireScript('utils.Timer', 'events.EventDispatcher', function() {
	
	if (!window.utils) {
		utils = new Object();
	}
	
	var Timer = utils.Timer = function Timer(ms) {
		var __self__ = this;
		
		this.inheritFrom = events.EventDispatcher;
		this.inheritFrom();
		
		var timer = false;
		var timeLapse = 0;
		
		var timerDispatch = function() {
			__self__.dispatchEvent('timer', { progress: (new Date()).getTime() - timeLapse });
		};
		
		this.start = function() {
			timeLapse = (new Date()).getTime();
			if (!timer) {
				timer = setInterval(timerDispatch, ms);
			}
		};
		
		this.stop = function() {
			if (!timer) {
				return;
			}
			clearInterval(timer);
			timer = false;
			timeLapse = 0;
		};
	};
	
});