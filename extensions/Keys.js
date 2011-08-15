if (!window.extensions) {
	extensions = new Object();
}

ScriptLoader.requireScript('extensions.Keys', 'extensions.Elements', function() {
	extensions.Keys = new (function() {
		if (utils.Browser.isIE) {
			HTMLElement.prototype.addKeyListener = function addKeyListener(callback) {
				this.attachEvent('onkeydown', callback.down);
				if (callback.up) {
					this.attachEvent('onkeydown', callback.up);
				}
			};
			
			HTMLElement.prototype.removeKeyListener = function removeKeyListener(callback) {
				this.detachEvent('onkeydown', callback.down);
				if (callback.up) {
					this.detachEvent('onkeydown', callback.up);
				}
			};
		} else {
			HTMLElement.prototype.addKeyListener = function addKeyListener(callback) {
				this.addEventListener('keydown', callback.down, false);
				if (callback.up) {
					this.addEventListener('keydown', callback.up, false);
				}
			};
			
			HTMLElement.prototype.removeKeyListener = function removeKeyListener(callback) {
				this.removeEventListener('keydown', callback.down, false);
				if (callback.up) {
					this.removeEventListener('keydown', callback.up, false);
				}
			};
		}
		
		this.cleanUp = function() {
			_openconsole.warn('Deleting Key Listening extension.  Are all event listeners removed?');
			// What we should do is have all key events dispatch from the document and find their way to the target.
			delete HTMLElement.prototype.addKeyListener;
			delete HTMLElement.prototype.removeKeyListener;
		};
	})();
});