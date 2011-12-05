R.createNamespace('contrib.utils.Browser');

contrib.utils.Browser = new (function Browser() {
	var __self__ = this;

	this.isIE = navigator.appName == "Microsoft Internet Explorer" && navigator.userAgent.indexOf('MSIE 9.0') == -1; // Exludes IE9
	this.isWebkit = !__self__.isIE && navigator.userAgent.indexOf('AppleWebKit') != -1;
	this.isFirefox = !__self__.isIE && !__self__.isWebkit && navigator.userAgent.indexOf('Firefox') != -1;
	this.isOpera = !__self__.isIE && !__self__.isWebkit && !__self__.isFirefox && navigator.userAgent.indexOf('Opera') != -1
	this.isIE9 = !__self__.isIE && !__self__.isWebkit && !__self__.isFirefox && !__self__.isOpera && navigator.userAgent.indexOf('MSIE 9.0') != -1;
	this.isIOS = __self__.isWebkit && (navigator.userAgent.indexOf('iPad') != -1 || navigator.userAgent.indexOf('iPhone') != -1);
	
	this.isAtleastFirefoxVersion = function (ver) {
		return __self__.isFirefox && Number(navigator.userAgent.split('Firefox/')[1].split('.')[0]) >= ver;
	};
	
	this.isBB = navigator.userAgent.indexOf('BlackBerry') != -1;
	
	var disabled = false;
	var touchStop = function(e) {
		e.preventDefault();
	};
	if (!document.body || !document.body.addEventListener) {
		this.disableTouchScroll = function() {
		};
		this.enableTouchScroll = function() {
		}; 
	} else {
		this.disableTouchScroll = function() {
			if (disabled) {
				return;
			}
			document.body.addEventListener('touchmove', touchStop, false);
			disabled = true;
		};
		this.enableTouchScroll = function() {
			if (disabled) {
				document.body.removeEventListener('touchmove', touchStop, false);
				disabled = false;
			}
		};
	}
	
	this.allowHash = true;
	this.currentUrl = '/';
	var urlData = null;
	this.getURLData = function() {
		var data = urlData;
		urlData = null;
		return data;
	};
	
	this.setUrl = function(newUrl, name, data) {
		__self__.currentUrl = newUrl;
		if (__self__.allowHash) {
			urlData = {
				'name': name,
				'data': data,
				'url': newUrl
			};
			if (window.history && window.history.pushState) {
				window.history.pushState(data, name, newUrl);
			} else {
				window.location.href = window.location.href + '#' + newUrl;
			}
		}
	};
	this.getUrl = function(excludeDomain) {
		if (!__self__.allowHash) {
			return __self__.currentUrl;
		}
		if (window.history && window.history.pushState) {
			return window.location.pathname;
		}
	    var hash = window.location.hash;
	    if (hash && hash.indexOf('/') == 1) {
	        return ((excludeDomain) ? '' : window.location.protocol + '//' + window.location.host) + hash.substr(1);
	    }
	    return ((excludeDomain) ? '' : window.location.protocol + '//' + window.location.host) + window.location.pathname;
	};
	this.parseTags = function() {
		var tags = document.getElementsByTagName('a');
		var size = tags.length;
		for (var i = 0; i < size; i++) {
			var anchor = tags[i];
			if (anchor['rel'] == 'pushState' && !anchor.onclick) {
				anchor.onclick = function() {
					__self__.setUrl(this.href);
					return false;
				};
			}
		}
	};
})();