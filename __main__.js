/* __main__ */
(function __main__() {
	window.settings = {
		'version': '2.0',
		'debugMode': false,
		'OpenConsole': false,
		'scripts': {
			'locations': {
				'default': ''
			},
			'MAIN_THREAD': '__main__'
		},
		'async': true || navigator.appName == "Microsoft Internet Explorer" // Absolutely cannot be false for MSIE
	};

	Array.prototype.removeAt = function removeAt(index) {
		if (index > -1 && index < this.length) {
			this.splice(index, 1);
		}
	};
	if (!Array.prototype.indexOf) { // Older versions of Internet Explorer
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
	if (!Array.prototype.lastIndexOf) {
		/* Implement */
	}
	Array.prototype.remove = function remove(obj) {
		this.removeAt(this.indexOf(obj));
	};
	Array.prototype.copy = function copy() {
		var size = this.length;
		var cpy = new Array();
		for (var i = 0; i < size; i++) {
			cpy.push(this[i]);
		}
		return cpy;
	};
	Object.prototype.toString = function toString() {
		var rtrn = '';
		for (var key in this) {
			rtrn += (rtrn ? ', ' : '') + key + ': ' + this[key];
		}
		return '{' + rtrn + '}';
	};

	// Array prototype extensions
	Array.prototype.toString = function toString(delim, wrapIt) {
		delim = delim ? delim : ', ';
		wrapIt = wrapIt ? ['[', ']'] : ['', ''];
		var size = this.length;
		var rtrn = '';
		for (var i = 0; i < size; i++) {
			rtrn += (!i ? '' : delim) + this[i];
		}
		return wrapIt[0] + rtrn + wrapIt[1];
	};
	// Extensions to be moved
	String.prototype.toTitleCase = function toTitleCase() {
		var words = this.split(' ');
		var numOfWords = words.length;
		var output = '';
		for (var i = 0; i < numOfWords; i++) {
			if (i) {
				output += ' ';
			}
			var char = words[i].charCodeAt(0);
			if (char > 96 && char < 123) {
				output += String.fromCharCode(char - 32);
				output += words[i].substr(1);
			} else {
				output += words[i];
			}
		}
		return output;
	};


	// OpenConsole
	initConsole = function () {
		_openconsole = new (function Console() {
			var __self__ = this;

			var cache = {}; // Cached data!
			var savedData = [];

			var defaultCount = 0;
			var counts = {};

			var dates = {};
			var profiles = 0;
			var activeProfiles = new Array();

			this.isOpenConsole = true;

			this.onnotify;

			this.notify = function (arguments, methodName) {
				if (!settings.debugMode && (methodName == 'debug' || methodName == 'assert' || methodName == 'trace')) {
					return null;
				}
				// Arguments is saved as an array, the reader (the console App... whatever it may be, will be the one to READ it)
				cache = {
					type: methodName,
					data: arguments
				};
				savedData[savedData.length] = cache;
				if (__self__.onnotify) {
					__self__.onnotify(cache);
				}
				var toSay = '';
				var index = 0;
				while (cache.data[index]) {
					toSay += ' ';
					toSay += cache.data[index];
					index++;
				}
				//alert(cache.type + ':' + toSay);
				return cache;
			};

			var notify = __self__.notify; // So we can drop the __self__

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


			this.assert = function () {
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
				if (title) {
					notify([++defaultCount], 'count');
					return;
				}
				if (!counts[title]) {
					counts[title] = 0;
				}
				notify([title, ++counts[title]], 'count');
			};


			// Breaks down an element and its properties
			this.dir = function (obj) {
				if (typeof obj === 'object') {
					notify([obj], 'dir');
					return;
				}
				throw 'Requires an interable object';
			};

			// The same as above but in an xml like format
			this.dirxml = function (node) {
				if (node.constructor.name.indexOf('HTML') != -1) {
					notify([node], 'dirxml');
					return;
				}
				throw 'Requires a node object';
			};

			// Creates a nice 'indented block' (a section in our JSON) for future messages
			this.group = function () {
				notify(arguments, 'group');
			};

			// Same as first, but with an initial message to keep it collapsed (more visiual)
			this.groupCollapsed = function () {
				notify(arguments, 'groupCollapsed');
			};

			// Closes the group
			this.groupEnd = function () {
				notify([], 'groupEnd');
			};

			// Starts a timer
			this.time = function (title) {
				if (!title) {
					throw 'Name required to create timer';
					return;
				}
				dates[title] = (new Date()).getTime();
				notify([title], 'time');
			};

			// Ends that timer and displays the result.. profile utilizes this?
			this.timeEnd = function (title) {
				if (!title || !dates[title]) {
					throw 'Name required to identify and end a timer';
					return;
				}
				notify([title, timeEnd], 'timeEnd');
				delete dates[title];
			};

			// Starts javascript profiling.. for now, we just use time
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

			// Creates a stack trace of what called this.  Simple to implement :)
			this.trace = function () {
				var callstack = [];
				var isCallstackPopulated = false;
				try {
					i.dont.exist += 0; //doesn't exist- that's the point
				} catch (e) {
					if (e.stack) { //Firefox
						var lines = e.stack.split('\n');
						for (var i = 0, len = lines.length; i < len; i++) {
							if (lines[i].match(/^\s*[A-Za-z0-9\-_\$]+\(/)) {
								callstack.push(lines[i]);
							}
						}
						//Remove call to printStackTrace()
						callstack.shift();
						isCallstackPopulated = true;
					} else if (window.opera && e.message) { //Opera
						var lines = e.message.split('\n');
						for (var i = 0, len = lines.length; i < len; i++) {
							if (lines[i].match(/^\s*[A-Za-z0-9\-_\$]+\(/)) {
								var entry = lines[i];
								//Append next line also since it has the file info
								if (lines[i + 1]) {
									entry += ' at ' + lines[i + 1];
									i++;
								}
								callstack.push(entry);
							}
						}
						//Remove call to printStackTrace()
						callstack.shift();
						isCallstackPopulated = true;
					}
				}
				if (!isCallstackPopulated) { //IE and Safari
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

			/* Non-standard API */
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

			// This console will catch all errors
			window.onerror = function (msg, url, linenumber) {
				__self__.error(url ? url : settings.scripts.threadName, linenumber ? '@ ' + linenumber + ': ' : ': ', msg);
				// Should I include a stack trace?
				//return false; // Cancel default action
				return true;
			};
		})();
	};


	/* This is to change ?? */
	if (!window.console || settings.OpenConsole) {
		initConsole();
		try {
			console = _openconsole;
		} catch (e) {
			//?
		}
	} else if (window.console) {
		window._openconsole = console;
		
		try {
			if (!settings.debugMode) {
				console.debug = function () {
				};
	
				console.assert = function () {
				};
	
				console.trace = function () {
				};
			}
		} catch (e) {
			// Do nothing! :(
		}
	}

	_openconsole.info('Initializing ScriptLoader.');

	// Static class ScriptLoader.
	var ScriptLoader = window.ScriptLoader = new Object();
	ScriptLoader.registerPackage = function(packageStr) {
		/* To implement */
	};
	// Node for script relationships
	ScriptLoader.Script = function (url, name) {
		ScriptLoader.library[url] = this; // Addition to library reference!
		var __self__ = this;

		/* States */
		// handled by loadScript and This object (unless script is __main__, then
		// requireScript does some handling of the first two states and upon firing, the last state is
		// set to true
		this.requested = false;
		this.loaded = false;
		this.ready = false;

		/* Properties */
		this.url = url;
		this.name = name;

		/* Connections */
		this.dependents = new Array(); // What needs us
		this.dependencies = new Array(); // What we need!!

		var dependentCache = {};
		var dependencyCache = {};

		/* API */
		this.addDependent = function (dependent) {
			if (dependentCache[dependent.url]) {
				return;
			}
			__self__.dependents[__self__.dependents.length] = dependentCache[dependent.url] = dependent;
		};

		this.addDependency = function (dependency) {
			if (dependencyCache[dependency.url]) {
				return;
			}
			__self__.dependencies[__self__.dependencies.length] = dependencyCache[dependency.url] = dependency;
		};

		/* Upon download and post-running */
		// functions that are waiting on this script to download.
		this.callbacks = new Array();
		this.onload = function () {
			if (__self__.loaded) {
				return false;
			}
			// We're done!
			__self__.loaded = true;
			for (var i = 0; i < __self__.callbacks.length; i++) {
				__self__.callbacks[i]({ 'scriptName': name, 'url': url });
			}
			__self__.callbacks = new Array();
			return true;
		};

		/* Upon all scripts downloaded */
		// Here, parents are dependents, and children are dependencies
		// functions that are wating on this script to be ready.
		this.waitingScripts = new Array();
		this.onready = function () {
			// Are all of our children/dependencies ready?
			for (var i = 0; i < __self__.dependencies.length; i++) {
				if (!__self__.dependencies[i].ready)
					return;
			}

			// execute! -- We should change waitingScripts to just waitingScript... no?
			while (__self__.waitingScripts.length > 0) {
				_openconsole.debug(name, 'is executing', __self__.waitingScripts.length, 'stalled function(s).');
				var scriptMe = __self__.waitingScripts.shift();
				if (scriptMe)
					scriptMe();
			}

			// We're ready!
			__self__.ready = true;

			if (url == settings.scripts.MAIN_THREAD) {
				var index = ScriptLoader.threads.indexOf(__self__); // This will remove this script as a thread entry point...
				if (index == -1) {
					throw 'This thread does not exist.  We have an issue.  Perhaps perform a trace in debug mode.';
					return;
				}
				_openconsole.debug('Script Loading thread #' + (index + 1), 'is complete.');
				ScriptLoader.threads.removeAt(index);
				return;
			}

			_openconsole.debug(name, 'is ready and will attempt to execute its', __self__.dependents.length, 'dependent(s)');

			// Here, we go through each dependent, get the siblings related to this one, and if all are ready, execute the dependent!
			var size = __self__.dependents.length;
			for (var i = 0; i < size; i++) {
				if (__self__.dependents[i].ready) {
					_openconsole.debug(name, 'is skipping the attempt to execute', __self__.dependents[i].name, 'since it is READY.');
					continue;
				}
				var sibs = __self__.dependents[i].dependencies;
				var executeDependent = true;
				var length = sibs.length;
				_openconsole.debug(name, 'in relation to', __self__.dependents[i].name, 'has', length - 1, 'sibling scripts.');
				for (var j = 0; j < length; j++) {
					if (url != sibs[j].url) {
						_openconsole.debug(name + '\'s sibling', sibs[j].name, 'is', (sibs[j].ready ? '' : 'not ') + 'ready');
						if (!sibs[j].ready) { // This checks itself... need to change that.
							executeDependent = false;
							_openconsole.debug('We are skipping checking the rest of', name + '\'s', 'siblings');
							break;
						}
					}
				}
				if (executeDependent) {
					_openconsole.debug(name, 'is calling on its dependent', __self__.dependents[i].name, 'to execute');
					__self__.dependents[i].onready();
				}
			}
		};

		// Here, parents are dependencies, and children are dependents
		this.unload = function (dependentScript) {
			dependents.remove(dependentScript);

			if (name && dependents.length == 0) {
				var package = name.split('.');
				var size = package.length;

				for (var i = 0; i < size; i++) {
					var reference = window;
					var deleteIndex = size - i - 1;
					for (var j = 0; j < deleteIndex; j++) // We do all packages except the last one!
						reference = reference[package[j]];
					var toDelete = package[deleteIndex];

					var empty = true;
					// If this is not the object being intially erased but some package that contained it and
					// this package contains no more objects, we can erase it too!
					if (i > 0) {
						for (var obj in reference) {
							// If the current obj is not the cleanUp, we break;
							if (obj != reference.cleanUp) {
								empty = false;
								break;
							}
						}
					}
					if (empty) {
						if (typeof reference[toDelete].cleanUp == 'function') {
							reference[toDelete].cleanUp();
						}
						delete reference[toDelete];
					}
				}

				// We should remove reference of this script from memory.
				delete ScriptLoader.library[url];

				// Now that we have deleted what we can.. we should cycle through our dependencies and, if
				// they have no dependents other than ourselves, we will remove that one... and so forth.
				while (dependencies.length > 0) {
					dependencies.unload(this); // We remove ourselves as dependents from each of our dependencies.
				}
			}
		};
	};

	/* Static utilities */
	ScriptLoader.isName = function (name) {
		return name.indexOf('/') == -1;
	};
	ScriptLoader.convertToUrl = function (path) {
		if (settings.scripts.locations[path]) {
			return settings.scripts.locations[path];
		}
		return settings.scripts.locations['default'] + path.replace(/\./g, '/') + '.js';
	};


	/* References to created scripts */
	// An array of all asyncronous threads loading scripts from the top level (__main__)
	ScriptLoader.threads = new Array();
	// A reference of all Scripts indexed by url
	ScriptLoader.library = {};
	// A reference of all Scripts by name to url conversion
	ScriptLoader.getScriptByName = function (name) {
		return ScriptLoader.library[ScriptLoader.convertToUrl(name)];
	};


	/* static API */
	// loadScript should be either synchronous or asynchronous.  IE can only be asynchronous :(
	ScriptLoader.loadScript = function (name, callback) {
		callback = callback ? callback : function () { };

		var url;
		var script;
		if (typeof name == 'string') {
			// Since name is a string, we figure out if it's a url or not
			url = name;
			if (ScriptLoader.isName(name)) {
				url = ScriptLoader.convertToUrl(name);
			} else {
				name = false;
			}
			// Once we sort that out, we see if we have already requested this script in the library
			if (ScriptLoader.library[url] && ScriptLoader.library[url].requested) {
				// One already exists and it has been requested!  So we append our callback and let it be!
				var script = ScriptLoader.library[url];
				if (script.loaded) {
					_openconsole.debug(name, 'is already downloaded.');
					callback({ 'scriptName': name, 'url': url });
				} else {
					_openconsole.debug(name, 'is already requested but has yet to download.');
					script.callbacks[0] = callback; // ? Just a test... might work better?  Only runs the last one made.
					// We might end up doing the same for waitingScripts.
					//script.callbacks[script.callbacks.length] = callback;
				}
				// We return here because the script has already been requested and thus no script tag is required.
				return script;
			}
			// It was never requested... so we should create a new one!
			script = new ScriptLoader.Script(url, name);
		} else {
			// Otherwise we were passed a script object!  Crazy sauce!
			script = name;
			url = script.url;
			name = script.name;

			// If we have passed this script before, we should account for that!
			if (script.requested) {
				if (script.loaded) {
					// Let's just call the callback immediately!
					_openconsole.debug(name, 'is already downloaded.');
					callback({ 'scriptName': name, 'url': url });
				} else {
					_openconsole.debug(name, 'is already requested but has yet to download.');
					script.callbacks[0] = callback; // ?
					//script.callbacks[script.callbacks.length] = callback;
				}
				return script;
			}
		}
		script.requested = true;
		_openconsole.debug(name, 'has been requested for download.');
		script.callbacks[0] = callback; // ?
		//script.callbacks[script.callbacks.length] = callback;

		// Add the tag!
		var newScript = document.createElement('script');
		newScript.type = 'text/javascript';
		newScript.async = true;
		newScript.src = url;
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
	ScriptLoader.analyzeImport = function(newScript) {
		if (newScript.ready) {
			// We're ready... so let's skip to the below code and try our dependents
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
			_openconsole.debug(newScript.name, 'is ready and will again attempt to execute its', newScript.dependents.length, 'dependents(s)');
			newScript.onready();
		} else if (!newScript.dependencies.length) {
			// We have zero added dependencies
			_openconsole.debug(newScript.name, 'has ZERO dependencies and thus will attempt executing its',
								newScript.dependents.length, 'dependent(s).');
			newScript.onready();
		} else {
			// We have dependencies AND we have yet to execute our own scripts... but are our dependencies ready?
			var ready = true;
			for (var i = 0; i < newScript.dependencies.length; i++) {
				if (!newScript.dependencies[i].ready) {
					ready = false;
					break;
				}
			}
			if (ready) {
				_openconsole.debug(newScript.name, 'has', newScript.dependencies.length, 'dependenc(y/ies) but they are all ready.',
									newScript.name, 'will attempt to execute its', newScript.dependents.length, 'dependent(s).');
				newScript.onready();
			}
		}
	};
	ScriptLoader.importRequirement = function (newScript) {
		if (!settings['async'] && navigator.appName != "Microsoft Internet Explorer") {
			importScript(newScript.url);
			ScriptLoader.analyzeImport(newScript);
			return;
		}
		ScriptLoader.loadScript(newScript, function (e) {
			ScriptLoader.analyzeImport(newScript);
		});
	};
	ScriptLoader.requireScript = function () {
		if (arguments.length < 3) {
			throw 'Insufficient number of arguments.';
			return;
		}
		// what we need to do here is manually create script objects and set the dependencies.  Once completed,
		// we call the loadScript function and pass the script object's name.
		var listeningScript;
		var url = arguments[0];
		var name = false;
		if (arguments[0] != settings.scripts.MAIN_THREAD && ScriptLoader.isName(arguments[0])) {
			name = arguments[0];
			url = ScriptLoader.convertToUrl(arguments[0]);
		}
		if (url == settings.scripts.MAIN_THREAD) {
			// Here, we create a new entry for loading scripts!
			_openconsole.debug('** Creating new script loading thread. **');
			listeningScript = ScriptLoader.threads[ScriptLoader.threads.length] = new ScriptLoader.Script(url, '__main__');
			listeningScript.requested = listeningScript.loaded = true; // Bam!
		} else if (ScriptLoader.library[url]) {
			listeningScript = ScriptLoader.library[url];
			_openconsole.debug('**', listeningScript.name, 'has downloaded and is now asking for its dependencies. **');
		} else {
			// We're trying to append to a thread/script that was never created.
			throw 'Adding a script called ' + (!name ? url : name) + ' that was never initially requested.';
			return;
		}
		var size = arguments.length - 1;
		listeningScript.waitingScripts[listeningScript.waitingScripts.length] = arguments[size];
		// The listening script will already have its dependencies defined (either through this function or,
		// if it's an __main__ thread, it will have no dependencies!)

		_openconsole.debug(listeningScript.name, 'has', size - 1, 'dependenc(y/ies).');
		// Thus, let us add our dependents.
		for (var i = 1; i < size; i++) {
			var requiredUrl = arguments[i];
			var requiredName = false;
			if (ScriptLoader.isName(requiredUrl)) {
				requiredName = requiredUrl;
				requiredUrl = ScriptLoader.convertToUrl(requiredUrl);
			}
			// newScript is added as a dependency for the listeningScript
			var newScript = ScriptLoader.library[requiredUrl] ?
								ScriptLoader.library[requiredUrl] :
								new ScriptLoader.Script(requiredUrl, requiredName);
			if (newScript.ready) {
				_openconsole.debug(i + ')', listeningScript.name, 'requires', newScript.name,
									'and it is ready to execute', listeningScript.name + '.');
			} else if (newScript.loaded) {
				_openconsole.debug(i + ')', listeningScript.name, 'requires', newScript.name,
									'and it is already downloaded but it is waiting on its', newScript.dependencies.length,
									'dependenc(y/ies) before executing.');
			} else if (newScript.requested) {
				_openconsole.debug(i + ')', listeningScript.name, 'requires', newScript.name,
									'and it is already requested. It has yet to download.');
			} else {
				_openconsole.debug(i + ')', listeningScript.name, 'is appending the script', newScript.name,
									'with source:', newScript.url, 'to the DOM.');
			}
			listeningScript.addDependency(newScript);
			newScript.addDependent(listeningScript);
			// Now, for each script, we're going to perform a loadScript and set the callback
			ScriptLoader.importRequirement(newScript);
		}

		_openconsole.debug('**', listeningScript.name, 'has been parsed and finished asking for its',
							listeningScript.dependencies.length, 'dependenc(y/ies). **');
	};
	ScriptLoader.unloadScript = function (name) {
		ScriptLoader.getScriptByName(name).unload();
	};

	_openconsole.info('ScriptLoader ready.');
})();