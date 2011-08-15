/* twitter service! -- this is now deprecated.  Moved to services.CrossDomain */


// This may never be necessary as twitter callbacks simply call an EXPOSED function.  Maybe we can just create  function :)
if (!window.services) {
	services = new Object();
}
	
services.Twitter = new Object();
_openconsole.warn('services.Twitter is deprecated.  Please switch to services.CrossDomain');
services.Twitter.load = function(url, callbackName) {
	
	ScriptLoader.loadScript(url + (url.indexOf('?') == -1 ? '?' : '&') + 'callback=' + callbackName, function() {
		// Do we wish to do anything here?
	});
	
};