/* Pop-up user-interface module */

ScriptLoader.requireScript('ui.Dialog', 'events.EventDispatcher', 'extensions.DOMTweener', 'extensions.Document', function() {
	
	if (!window.ui) {
		ui = new Object();
	}
	
	// TODO: Add container support.
	ui.Dialog = function Dialog(dialog, overlay) {
		this.inheritFrom = events.EventDispatcher;
		this.inheritFrom();
		delete this.inheritFrom;

		var __self__ = this;
		var mover;

		this.getDialog = function () {
			return dialog;
		};

		var moveMe = function () {
			var coord = document.getCenter({ 'width': dialog.offsetWidth, 'height': dialog.offsetHeight }, true);
			dialog.tween('top', { 'to': coord.posY, 'unit': 'px' });
			dialog.tween('left', { 'to': coord.posX, 'unit': 'px' });
		};

		this.open = function () {
			if (dialog.getStyleValue('opacity') > 0) {
				__self__.addEventListener('close', function (e) {
					__self__.removeEventListener(e.listener);
					__self__.open();
				});
				__self__.close();
				return;
			}

			/**/
			dialog.style.display = 'block';
			var coord = document.getCenter({ 'width': dialog.offsetWidth, 'height': dialog.offsetHeight }, true);
			dialog.style.left = coord.posX + 'px';
			dialog.style.top = coord.posY + 'px';
			overlay.style.display = 'block';
			/**/
			if (overlay) {
				overlay.tween('opacity', { 'to': 100 });
				overlay.onclick = function(e) {
					__self__.close();
					events.preventDefaults(e);
					return false;
				};
			}
			dialog.tween('opacity', { 'to': 100, 'oncomplete': function() {
				__self__.dispatchEvent('open', {});
			}});
			
			// KK, now we need something.  extensions.Elements?
			if (utils.Browser.isIE) {
				window.attachEvent('onresize', moveMe);
			} else {
				window.addEventListener('resize', moveMe, false);
			}
		};

		this.close = function () {
			if (overlay) {
				overlay.tween('opacity', { 'to': 0, 'oncomplete': function() {
					overlay.style.display = 'none';
				}});
				overlay.onclick = null;
			}
			dialog.tween('opacity', { 'to': 0, 'oncomplete': function() {
				dialog.style.display = 'none';
				__self__.dispatchEvent('close', {});
			}});
			if (utils.Browser.isIE) {
				window.detachEvent('onresize', moveMe);
			} else {
				window.removeEventListener('resize', moveMe, false);
			}
		};
	};
});