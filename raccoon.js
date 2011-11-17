(function() {
	var R = new Object();
	if (!window.Raccoon) {
		Raccoon = R;
	}
	if (!window.R) {
		window.R = R;
	}
	
	R.MAIN_THREAD = '__main__';
	var defaultPath = '';
	var fileMatches = {};
	var async = true;
	
	var settings = R.settings = new (function Settings(R, fileMatches) {
		var __self__ = this;
		var pathSet = false;
		var version = '1.1';
		var devMode = false;
		
		this.version = function() {
			return version;
		};
		this.async = function(bool) {
			if (!bool && bool != false)
				return async;
			async = bool || navigator.appName == "Microsoft Internet Explorer";
			return bool;
		};
		this.devMode = function(setToDev) {
			if (!setToDev && setToDev != false)
				return devMode;
			devMode = setToDev;
			return setToDev;
		};
		this.setDefaultPath = function(path, force) {
			if (pathSet && !force)
				return;
			pathSet = true;
			defaultPath = path;
		};
		this.addPath = function(name, uri) {
			fileMatches[name] = uri;
		};
		this.setPaths = function() {
			var numOfRules = arguments.length;
			for (var i = 0; i < numOfRules; i++) {
				if (arguments[i].length == 2) {
					__self__.addPath(arguments[i][0], arguments[i][1]);
				}
			}
		};
	})(R, fileMatches);
	
	(function helpers() {
		Array.prototype.removeAt = function removeAt(index) {
		if (index > -1 && index < this.length) {
			this.splice(index, 1);
			}
		};
		if (!Array.prototype.indexOf) { // IE
			Array.prototype.indexOf = function indexOf(val) {
				var size = this.length;
				for (var i = 0; i < size; i++) {
					if (this[i] == val) {
						return i;
					}
				}
				return -1;
			};
		}
		Array.prototype.remove = function remove(obj) {
			this.removeAt(this.indexOf(obj));
		};
	})();
	
	var console = R.Console = null;
	R.initConsole = function(settings) {
		console = R.Console = new (function Console(settings) {
			var __self__ = this;
			var cache = {};
			var savedData = [];
			var defaultCount = 0;
			var counts = {};
			var dates = {};
			var profiles = 0;
			var activeProfiles = new Array();
			
			this.notify = function (arguments, methodName) {
				if (!settings.devMode() && (methodName == 'debug' || methodName == 'assert' || methodName == 'trace')) {
					return null;
				}
				savedData[savedData.length] = cache = {
					type: methodName,
					data: arguments
				};
				if (__self__.onnotify) {
					__self__.onnotify(__self__.pop());
				}
				var toSay = '';
				var index = 0;
				while (cache.data[index]) {
					toSay += ' ';
					toSay += cache.data[index];
					index++;
				}
				return cache;
			};
			var notify = __self__.notify;
			this.log = function () {
				notify(arguments, 'log');
			};
			this.debug = function () {
				notify(arguments, 'debug');
			};
			this.info = function () {
				notify(arguments, 'info');
			};
			this.warn = function () {
				notify(arguments, 'warn');
			};
			this.error = function () {
				notify(arguments, 'error');
			};
			this.assert = function () { // Review
				var newObj = {};
				for (var i in arguments) {
					if (i != 0) {
						newObj[i] = arguments[i];
					} else {
						newObj[0] = arguments[0] ? 'Pass:' : 'Fail:';
					}
				}
				notify(newObj, 'assert');
			};
			this.count = function (title) {
				if (!title) {
					notify([++defaultCount], 'count');
					return;
				}
				if (!counts[title]) {
					counts[title] = 0;
				}
				notify([title, ++counts[title]], 'count');
			};
			this.dir = function (obj) { // Review
				if (typeof obj === 'object') {
					notify([obj], 'dir');
					return;
				}
				throw 'Requires an iterable object';
			};
			this.dirxml = function (node) {
				if (node.constructor.name.indexOf('HTML') != -1) {
					notify([node], 'dirxml');
					return;
				}
				throw 'Requires a node object';
			};
			this.group = function () {
				notify(arguments, 'group');
			};
			this.groupCollapsed = function () {
				notify(arguments, 'groupCollapsed');
			};
			this.groupEnd = function () {
				notify([], 'groupEnd');
			};
			this.time = function (title) {
				if (!title) {
					throw 'Name required to create timer';
					return;
				}
				dates[title] = (new Date()).getTime();
				notify([title], 'time');
			};
			this.timeEnd = function (title) {
				if (!title || !dates[title]) {
					throw 'Name required to identify and end a timer';
					return;
				}
				notify([title, timeEnd], 'timeEnd');
				delete dates[title];
			};
			this.profile = function (optName) {
				if (!optName) {
					optName = 'Profile' + (++profiles);
				}
				activeProfiles.push(optName);
				__self__.time(optName);
			};
			this.profileEnd = function () {
				if (activeProfile.length) {
					__self__.timeEnd(activeProfiles.pop());
					return;
				}
				throw 'A profile must be started before we can stop one';
			};
			this.trace = function () {
				var callstack = [];
				var isCallstackPopulated = false;
				try {
					throw 'tracing'
				} catch (e) {
					if (e.stack) {
						var lines = e.stack.split('\n');
						for (var i = 0, len = lines.length; i < len; i++) {
							if (lines[i].match(/^\s*[A-Za-z0-9\-_\$]+\(/)) {
								callstack.push(lines[i]);
							}
						}
						callstack.shift();
						isCallstackPopulated = true;
					} else if (window.opera && e.message) {
						var lines = e.message.split('\n');
						for (var i = 0, len = lines.length; i < len; i++) {
							if (lines[i].match(/^\s*[A-Za-z0-9\-_\$]+\(/)) {
								var entry = lines[i];
								if (lines[i + 1]) {
									entry += ' at ' + lines[i + 1];
									i++;
								}
								callstack.push(entry);
							}
						}
						callstack.shift();
						isCallstackPopulated = true;
					}
				}
				if (!isCallstackPopulated) {
					var currentFunction = arguments.callee.caller;
					while (currentFunction) {
						var fn = currentFunction.toString();
						var fname = fn.substring(fn.indexOf('function') + 8, fn.indexOf('')) || 'anonymous';
						callstack.push(fname);
						currentFunction = currentFunction.caller;
					}
				}
				notify(callstack, 'trace');
			};
			
			this.clear = function () {
				cache = {};
				savedData = [];
			};
			this.dump = function () {
				return savedData;
			};
			this.pop = function () {
				var rtrn = cache;
				cache = {};
				return rtrn;
			};
			this.onnotify = null;
		})(settings);
		try {
			window.console = console;
		} catch(e) {
			console.warn('Unable to set global \'console\' variable -- ', e);
		}
	};
	
	if (!window.console) {
		R.initConsole(settings);
		window.onerror = function (msg, url, linenumber) {
			R.Console.error(url ? url : settings.scripts.threadName, linenumber ? '@ ' + linenumber + ': ' : ': ', msg);
			return true;
		};
	} else {
		console = R.Console = window.console;
		if (!settings.devMode()) {
			console.debug = console.trace = console.assert = function() {};
		} else if (!console.debug) {
			console.debug = console.log;
		}
	}
	
	console.info('RaccoonJS v' + settings.version() + ' settings and console modules are ready');
	console.info('Raccoon API is initializing');
	
	(function ScriptLoader(R, settings, console, paths, thread) {
		var copyObject = function(obj) {
			var copy = new Object();
			for (var prop in obj) {
				copy[prop] = obj[prop];
			}
			return copy;
		};
		
		var library = {};
		R.getLibrary = function() {
			return copyObject(library);
		};
		var threads = new Array();
		R.getThreads = function() {
			return copyObject(threads);
		};
		var packages = {};
		R.getPackages = function() {
			return copyObject(packages);
		};
		var convertToUrl = function (name) {
			if (paths[name]) {
				return paths[name];
			}
			return defaultPath + (name.replace(/\./g, '/') + '.js').replace('.min.js', '.js');
		};
		var isName = function(str) {
			return str.indexOf('/') == -1;
		};
		var getScriptNode = function(url) {
			if (isName(url)) {
				url = convertToUrl(url);
			}
			if (library[url]) {
				return library[url];
			}
			return false;
		};
		var analyzeImport = function(newScript) {
			if (newScript.ready) {
				var allReady = true;
				var dependentSize = newScript.dependents.length;
				for (var i = 0; i < dependentSize; i++) {
					if (!newScript.dependents[i].ready) {
						allReady = false;
						break;
					}
				}
				if (allReady) {
					return;
				}
				console.debug(newScript.name, 'is ready and will again attempt to execute its', newScript.dependents.length, 'dependents(s)');
				newScript.onready();
			} else if (!newScript.dependencies.length) {
				console.debug(newScript.name, 'has ZERO dependencies and thus will attempt executing its', newScript.dependents.length, 'dependent(s).');
				newScript.onready();
			} else {
				var ready = true;
				for (var i = 0; i < newScript.dependencies.length; i++) {
					if (!newScript.dependencies[i].ready) {
						ready = false;
						break;
					}
				}
				if (ready) {
					console.debug(newScript.name, 'has', newScript.dependencies.length, 'dependenc(y/ies) but they are all ready.', newScript.name, 'will attempt to execute its', newScript.dependents.length, 'dependent(s).');
					newScript.onready();
				}
			}
		};
		var syncImport = function(script) {
			importScript(script.url);
			script.onload();
			return script;
		};
		var asyncImport = function(script) {
			var newScript = document.createElement('script');
			newScript.type = 'text/javascript';
			newScript.async = true;
			newScript.src = script.url;
			newScript.onload = function () {
				if (script.onload()) {
					newScript.parentNode.removeChild(newScript);
				}
			};
			newScript.onreadystatechange = function () {
				if ((this.readyState == 'complete' || this.readyState == 'loaded') && script.onload()) {
					newScript.parentNode.removeChild(newScript);
				}
			};
			var topScript = document.getElementsByTagName('script')[0];
			topScript.parentNode.insertBefore(newScript, topScript);
			topScript = null;
			return script;
		};
		var includeRequirement = function(newScript) {
			R.include(newScript, function() {
				analyzeImport(newScript);
			});
		};
		var ScriptNode = function ScriptNode(url, name) {
			var __self__ = this;
			if (url != thread) {
				library[url] = this;
			}
			this.requested = false;
			this.loaded = false;
			this.ready = false;
			this.url = url;
			this.name = name;
			this.dependents = new Array();
			this.dependencies = new Array();
			var dependentCache = {};
			var dependencyCache = {};
			
			this.addDependent = function (dependent) {
				if (typeof dependent == 'string') {
					dependent = library[dependent];
				}
				if (dependentCache[dependent.url]) {
					return;
				}
				__self__.dependents[__self__.dependents.length] = dependentCache[dependent.url] = dependent;
			};
			this.addDependency = function (dependency) {
				if (typeof dependency == 'string') {
					dependency = library[dependency];
				}
				if (dependencyCache[dependency.url] || dependencyCache[dependency.url]) {
					return;
				}
				__self__.dependencies[__self__.dependencies.length] = dependencyCache[dependency.url] = dependency;
			};
			this.removeDependent = function(dependent) {
				if (typeof dependent == 'string') {
					dependent = library[dependent];
				}
				if (dependentCache[dependent.url]) {
					__self__.dependents.remove(dependent);
					delete dependentCache[dependent.url];
				}
			};
			this.removeDependency = function(dependency) {
				if (typeof dependency == 'string') {
					dependency = library[dependency];
				}
				if (dependencyCache[dependency.url]) {
					__self__.dependencies.remove(dependency);
					delete dependencyCache[dependency.url];
				}
			};
			this.callbacks = new Array();
			this.onload = function () {
				if (__self__.loaded) {
					return false;
				}
				__self__.loaded = true;
				var callbacks = __self__.callbacks;
				var size = callbacks.length;
				for (var i = 0; i < size; i++) {
					callbacks[i]({ 'scriptName': name || null, 'url': url, 'namespace':name ? R.registerNamespace(name) : null });
				}
				__self__.callbacks = new Array();
				return true;
			};
			this.waitingScripts = new Array();
			this.onready = function () {
				var dependencies = __self__.dependencies;
				var size = dependencies.length;
				for (var i = 0; i < size; i++) {
					if (!dependencies[i].ready)
						return;
				}
				var waitingScripts = __self__.waitingScripts;
				while (waitingScripts.length > 0) {
					console.debug(name || url, 'is executing', waitingScripts.length, 'stalled function(s)');
					var scriptMe = waitingScripts.shift();
					if (scriptMe)
						scriptMe();
				}
				__self__.ready = true;
				if (url == thread) {
					var index = threads.indexOf(__self__);
					if (index == -1) {
						throw 'Top level thread is not accessible';
						return;
					}
					console.info('Thread #' + (index + 1), 'loaded', '[' + __self__.dependencies.join(', ') + ']', 'and executed successfully');
					//threads.removeAt(index);
					return;
				}
				var dependents = __self__.dependents;
				size = dependents.length;
				console.debug(name || url, 'is ready and will attempt to execute its', size, 'dependent(s)');
				for (var i = 0; i < size; i++) {
					if (dependents[i].ready) {
						console.debug(name || url, 'is skipping the attempt to execute', dependents[i].name, 'since it is READY');
						continue;
					}
					var sibs = dependents[i].dependencies;
					var executeDependent = true;
					var length = sibs.length;
					console.debug(name || url, 'in relation to', dependents[i].name, 'has', length - 1, 'sibling scripts');
					for (var j = 0; j < length; j++) {
						if (url != sibs[j].url) {
							console.debug(name || url + '\'s sibling', sibs[j].name, 'is', (sibs[j].ready ? '' : 'not ') + 'ready');
							if (!sibs[j].ready) { // Review -  This checks itself... need to change that.
								executeDependent = false;
								console.debug('Skipping checking the rest of', name + '\'s', 'siblings');
								break;
							}
						}
					}
					if (executeDependent) {
						console.debug(name, 'is calling on its dependent', dependents[i].name, 'to execute');
						dependents[i].onready();
					}
				}
			};
			this.unloadScript;
			this.unload = function (dependentScript) {
				var dependents = __self__.dependents;
				console.debug(__self__.name, 'has', dependents.length, 'scripts which rely on it');
				if (dependentScript != thread) {
					var tempScript = library[dependenScript];
					__self__.removeDependent(dependentScript);
					dependentScript = tempScript;
				} else if (dependentScript == thread && dependents.length == 1)
					dependentScript = dependents.shift();
					dependentCache = {};
				if (__self__.name && dependents.length == 0) {
					dependentScript.removeDependency(__self__);
					var package = __self__.name.split('.');
					for (var i = 0; i < package.length; i++) {
						var reference = window;
						var pkgLvl = packages;
						var deleteIndex = package.length - i - 1;
						for (var j = 0; j < deleteIndex; j++) {
							reference = reference[package[j]];
							pkgLvl = pkgLvl[package[j]];
						}
						var toDelete = package[deleteIndex];
						var empty = true;
						if (i > 0) {
							empty = !pkgLvl[toDelete].count || pkgLvl[toDelete].count < 2;
						}
						if (empty) {
							if (reference[toDelete].dispose && typeof reference[toDelete].dispose == 'function') {
								reference[toDelete].dispose();
							}
							if (__self__.unloadScript) {
								__self__.unloadScript();
							}
							delete pkgLvl[toDelete];
							delete reference[toDelete];
						} else {
							pkgLvl[toDelete].count -= 1;
						}
					}
					delete library[url];
					var dependencies = __self__.dependencies;
					while (dependencies.length > 0) {
						dependencies.unload(__self__);
					}
					console.debug(__self__.name, 'has been successfully removed');
				} else {
					console.warn('Cannot remove', __self__.name, 'as other libraries rely on it');
				}
			};
			this.toString = function() {
				return __self__.name || __self__.url;
			};
		};
		R.registerNamespace = function(namespace) {
			var spaces = namespace.split('.');
			var size = spaces.length;
			if (spaces[size - 1] == 'min') {
				size -= 1;
				spaces.pop();
			}
			namespace = window;
			var pkgLvl = packages;
			for (var i = 0; i < size; i++) {
				var node = spaces[i];
				if (!namespace[node]) {
					namespace[node] = new Object();
				}
				if (!pkgLvl[node]) {
					pkgLvl[node] = {
						'count': 1
					};
				} else {
					pkgLvl[node] += 1;
				}
				namespace = namespace[node];
				pkgLvl = pkgLvl[node];
			}
			return namespace;
		};
		R.include = function(name, callback) {
			if (!callback) {
				callback = function() { };
			}
			var url;
			var script;
			if (typeof name == 'string') {
				url = name;
				if (isName(name)) {
					url = convertToUrl(name);
				} else {
					name = false;
				}
				if (library[url] && library[url].requested) {
					var script = library[url];
					if (script.loaded) {
						console.debug(name || url, 'is already downloaded');
						callback({ 'scriptName': name, 'url': url, 'namespace':name ? R.registerNamespace(name) : null });
					} else {
						console.debug(name || url, 'is already requested but has yet to download');
						script.callbacks[0] = callback;
					}
					return script;
				}
				script = new ScriptNode(url, name);
			} else {
				script = name;
				url = script.url;
				name = script.name;
				if (script.requested) {
					if (script.loaded) {
						console.debug(name || url, 'is already downloaded');
						callback({ 'scriptName': name, 'url': url, 'namespace':name ? R.registerNamespace(name) : null });
					} else {
						console.debug(name, 'is already requested but has yet to download');
						script.callbacks[script.callbacks.length] = callback;
					}
					return script;
				}
			}
			script.requested = true;
			console.debug(name || url, 'has been requested for download');
			script.callbacks[script.callbacks.length] = callback;
			if (settings.async()) {
				return asyncImport(script);
			} else {
				return syncImport(script);
			}
		};
		var requireScripts = function(hasName, args) {
			var listeningScript;
			var url = hasName ? args[0] : thread;
			var name = false;
			if (url != thread) {
				name = url;
				url = convertToUrl(name);
			} else {
				name = url + '[' + threads.length + ']';
			}
			if (library[url]) {
				listeningScript = library[url];
				console.debug('**', listeningScript.name, 'has downloaded and is now asking for its dependencies **');
			} else {
				console.debug('** Creating new script loading thread **');
				listeningScript = threads[threads.length] = new ScriptNode(url, name);
				listeningScript.requested = listeningScript.loaded = true;
			}
			var size = args.length - 1;
			if (typeof args[size - 1] == 'function') {
				size -= 1;
				listeningScript.waitingScripts[listeningScript.waitingScripts.length] = args[size + 1];
				listeningScript.unloadScript = args[size];
			} else {
				listeningScript.waitingScripts[listeningScript.waitingScripts.length] = args[size];
			}
			listeningScript.ready = false;
			console.debug(listeningScript.name, 'has', size - 1, 'dependenc(y/ies).');
			for (var i = hasName ? 1 : 0; i < size; i++) {
				var requiredUrl = args[i];
				var requiredName = false;
				if (isName(requiredUrl)) {
					requiredName = requiredUrl;
					requiredUrl = convertToUrl(requiredUrl);
				}
				var newScript = library[requiredUrl] ? library[requiredUrl] : new ScriptNode(requiredUrl, requiredName);
				if (settings.devMode()) {
					if (newScript.ready) {
						console.debug(i + ')', listeningScript.name, 'requires', newScript.name, 'and it is ready to execute', listeningScript.name + '.');
					} else if (newScript.loaded) {
						console.debug(i + ')', listeningScript.name, 'requires', newScript.name, 'and it is already downloaded but it is waiting on its', newScript.dependencies.length, 'dependenc(y/ies) before executing.');
					} else if (newScript.requested) {
						console.debug(i + ')', listeningScript.name, 'requires', newScript.name, 'and it is already requested. It has yet to download.');
					} else {
						console.debug(i + ')', listeningScript.name, 'is appending the script', newScript.name, 'with source:', newScript.url, 'to the DOM.');
					}
				}
				listeningScript.addDependency(newScript);
				newScript.addDependent(listeningScript);
				includeRequirement(newScript);
			}
			console.debug('**', listeningScript.name, 'has been parsed and finished asking for its', listeningScript.dependencies.length, 'dependenc(y/ies). **');
		};
		R.imports = function() {
			requireScripts(false, arguments);
		};
		R.require = function() {
			requireScripts(true, arguments);
		};
		R.remove = function(toRemove, sourceName) {
			console.debug(sourceName || thread, 'is removing', toRemove, 'from the DOM');
			var toRemove = getScriptNode(toRemove);
			if (toRemove) {
				toRemove.unload(sourceName && sourceName != thread ? getScriptNode(sourceName) : thread);
			}
		};
		console.info('RaccoonJS script loading system is loaded');
	})(R, settings, console, fileMatches, R.MAIN_THREAD);
	
	console.info('RaccoonJS is ready');
})();