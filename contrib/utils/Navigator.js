if (!window.contrib) {
	contrib = new Object();
}

if (!contrib.utils) {
	contrib.utils = new Object();
}

contrib.utils.Navigator = new (function Navigator() {
	var __self__ = this;
	var timer = false;
	var lastUrl = '';
	
	this.rules = new Array();
	var urlData = null;
	
	var forceHash = false;
	
	var getUrlData = function() {
		var data = urlData;
		urlData = null;
		return data;
	};
	
	this.useHash = function(bool) {
		forceHash = bool;
	};
	
	this.setUrl = function(newUrl, name, data) {
		if (!timer) {
			lastUrl = newUrl;
		}
		urlData = {
			'name': name,
			'data': data,
			'url': newUrl
		};
		if (!forceHash && window.history && window.history.pushState) {
			window.history.pushState(data, name, newUrl);
		} else {
			window.location.href = '#' + newUrl;
		}
	};
	
	var getHash = __self__.getHash = function() {
		var hash = window.location.hash ? window.location.hash.substr(1) : '';
		if (!forceHash && window.history && window.history.pushState) {
			return hash;
		}
		if (hash) {
			var otherHashIndex = hash.lastIndexOf('#');
			if (hash.indexOf('/') == 0 && otherHashIndex > -1) {
				return hash.substr(otherHashIndex + 1);
			}
		}
		return hash;
	};
	
	var getUrl = __self__.getUrl = function(excludeDomain) {
		var prefix = excludeDomain ? '' : window.location.protocol + '//' + window.location.host;
		if (!forceHash && window.history && window.history.pushState) {
			return prefix + window.location.pathname;
		}
	    var hash = window.location.hash;
	    if (hash && hash.indexOf('/') == 1) {
	        return prefix + hash.substr(1);
	    }
	    return prefix + window.location.pathname;
	};
	
	this.parseTags = function() {
		var tags = document.getElementsByTagName('a');
		var size = tags.length;
		for (var i = 0; i < size; i++) {
			var anchor = tags[i];
			if (anchor['rel'] == 'pushState' && !anchor.onclick) {
				anchor.onclick = function() {
					__self__.setUrl(this.href, this.title); // TODO pass all 'data-' attributes as the data object...
					// I know this is standard but not implemented.  However, I'm sure we could cycle through
					// the attributes and find all that start with 'data-'
					return false;
				};
			}
		}
	};
	
	var dispatchUrl = function(newUrl) {
		if (newUrl[newUrl.length - 1] == '/') {
			newUrl = newUrl.substr(0, newUrl.length - 1);
		}
		var size = __self__.rules.length;
		for (var i = 0; i < size; i++) {
			var pageObj = __self__.rules[i];
			if ((typeof pageObj.rule == 'string' && (new RegExp(pageObj.rule, 'i')).test(newUrl)) ||
					(pageObj.rule.test && pageObj.rule.test(newUrl))) {
				pageObj.method(getUrlData() || {
					'name': '',
					'data': null,
					'url': newUrl
				}, newUrl.split('/').slice(1), __self__.getPathSteps(newUrl));
				break;
			}
		}
	};
	
	var getLevelUp = function(path) {
		return new String(path.substr(0, path.lastIndexOf('/')));
	};
	
	var buildSteps = function(path, offset) {
		if (path.length == 1) {
			return ['/'];
		}
		path = path.split('/');
		var size = path.length;
		var steps = new Array();
		for (var i = 1; i <= size; i++) {
			steps[steps.length] = offset + path.slice(0, i).join('/') || '/';
		}
		return steps;
	};
	
	this.getPathSteps = function(targetUrl) {
		var path = new String(lastUrl);
		path = getLevelUp(path);
		var backSteps = new Array();
		while (targetUrl.indexOf(path) != 0 && path != '') {
			backSteps[backSteps.length] = path.toString();
			path = getLevelUp(path);
		}
		if (path.length > 0) {
			var steps = targetUrl.split(path)[1];
			return backSteps.concat(buildSteps(steps, path));
		}
		return backSteps.concat(buildSteps(targetUrl, ''));
	};
	
	var check = function() {
		var newUrl = getUrl(true);
		if (newUrl == lastUrl) {
			return;
		}
		dispatchUrl(newUrl);
		lastUrl = newUrl;
	};
	
	this.start = function() {
		if (timer) {
			return;
		}
		timer = setInterval(check, 500);
	};
	
	this.stop = function() {
		if (timer) {
			clearInterval(timer);
			timer = null;
		}
	};
})();