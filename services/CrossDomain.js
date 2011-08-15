if (!window.services) {
	services = new Object();
}
	
services.CrossDomain = new Object();
services.CrossDomain.load = function(url, callbackName) {
	ScriptLoader.loadScript(url + (url.indexOf('?') == -1 ? '?' : '&') + 'callback=' + callbackName, function() {
		// Maybe we can append this to some request stack that we can iterate through?
		_openconsole.info(url, 'executed successfuly.');
	});
};