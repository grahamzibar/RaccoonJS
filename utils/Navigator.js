/*
	
	Navigator is a static class we load and pass URL rules to.  It listens for changes in the url (after the #)
	and executes a specified function associated with that url based on a regular expression rule, passing in
	each string between '/' as parameters
	
	Thus, when we add a rule, it should be as follows:
	[{
		rule: 'value', // regular expression string
		method: funName // reference to the function to be executed
	}, etc...]
	
 */
 ScriptLoader.requireScript('utils.Navigator', 'utils.Browser', function() {
 	
 	if (!window.utils) {
 		utils = new Object();
 	}
 	
 	utils.Navigator = new (function Navigator() {
 		var __self__ = this;
 		
 		var getUrl = utils.Browser.getUrl;
 		
 		var timer;
 		var lastUrl = '';
 		
 		this.rules = new Array();
 		
 		var dispatchUrl = function(newUrl) {
 			var size = __self__.rules.length;
 			for (var i = 0; i < size; i++) {
 				var pageObj = __self__.rules[i];
 				if ((typeof pageObj.rule == 'string' && (new RegExp(pageObj.rule, 'i')).test(newUrl)) ||
 						(pageObj.rule.test && pageObj.rule.test(newUrl))) {
 					if (newUrl[newUrl.length - 1] == '/') {
 						newUrl = newUrl.substr(0, newUrl.length - 1);
 					}
 					pageObj.method(newUrl.split('/').slice(1));
 					break;
 				}
 			}
 		};
 		
 		var check = function() {
 			var newUrl = getUrl(true);
 			if (newUrl == lastUrl) {
 				return;
 			}
 			lastUrl = newUrl;
 			dispatchUrl(newUrl);
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
 		
 		//this.start();
 	})();
 	
 });