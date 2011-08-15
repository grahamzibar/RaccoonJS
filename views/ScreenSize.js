ScriptLoader.requireScript('views.ScreenSize', 'extensions.Elements', 'events.EventDispatcher', 'extensions.Document', function() {
	if (!window.views) {
		views = new Object();
	}
	
	views.ScreenSize = new (function ScreenSize() {
		var __self__ = this;
		var el = document.createElement('div');
		
		el.applyStyle({
			position:'fixed',
			top: '0px',
			right: '0px',
			'background-color': '#AEAEAE',
			opacity: '0.7',
			padding: '10px',
			color: '#FFFFFF',
			'font-size': '11px',
			'z-index': '101'
		});
		
		// Convert the following two function into a view!
		this.writeStats = function(stats) {
			var output = '';
			for (var stat in stats) {
				output += stat;
				output += ': ';
				output += stats[stat];
				output += '<br />';
			}
			el.innerHTML = output;
		};
		this.showScreenSize = function() {
			var dimensions = document.getViewport();
			__self__.writeStats({ 'Screen': dimensions.width + 'px' + ', ' + dimensions.height + 'px' });
		};
		this.showScreenSize();
		
		this.getContainer = function() {
			return el;
		};
		
		events.addHandler(window, 'onresize', __self__.showScreenSize);
		document.body.appendChild(el);
	})();
});