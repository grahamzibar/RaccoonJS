(function __Cache__() {
	if (!window.io) {
		io = new Object();
	}

	// Auto-saver
	var timer = setInterval(function saver() {
		var caches = Cache.caches;
		var size = caches.length;
		for (var i = 0; i < size; i++) {
			caches[i].save();
		}
	}, 10000); // We save all of our caches every 10 seconds

	// Cache class
	_openconsole.warn('This assumes JQuery $.toJSON is already loaded');
	var Cache = io.Cache = function Cache(name, cacheSize, canSave) {
		var __self__ = this;
		Cache.caches[Cache.caches.length] = this;

		var cache = {};
		reference = new Array();

		if (typeof canSave == 'undefined') {
			canSave = true;
		}
		if (!Cache.canSave) {
			// We can't save
			canSave = false;
		} else if (!canSave && localStorage[name]) {
			// We never wanted to save in the first place but we saved before...
			delete localStorage[name]; // BAM!
		}

		// This will try to load any existing cache from webstorage.
		// Called automatically on initialization
		// WARNING: this will replace the JSON cache.
		this.load = function () {
			if (canSave && localStorage[name]) {
				_openconsole.log('Loading', name, 'from storage');
				try {
					cache = eval('(' + localStorage[name] + ')');
				} catch (e) {
					_openconsole.error('Unable to load', name, 'from storage');
				}
				return;
			}
		};

		this.save = function () {
			if (canSave) {
				_openconsole.log('Saving', name, 'to storage');
				localStorage[name] = $.toJSON(cache); // Bam!  This is what we need to replace
			}
		};

		// This clears the JS cache and any saved data.
		this.clear = function () {
			cache = {};
			reference = new Array();
			if (canSave) {
				delete localStorage[name];
			}
		};

		/* We are not restricted to strings, but only use JSON compatible objects */
		this.add = function (key, obj) {
			if (!cache[key]) {
				// this one doesn't exist already! So it WILL be added.  Thus,
				// we might need to remove a previous one if we have exceeded
				// our cache limit.
				if (reference.length >= cacheSize) {
					// We've hit our max additions, so we need to remove one
					delete cache[reference.shift()]; // two birds with one stone!
				}
			} else {
				// We need to move it from wherever it is in the array to the end.
				reference.splice(reference.indexOf(key), 1);
				// reference removed.
			}
			cache[key] = obj;
			reference[reference.length] = key;
		};

		this.remove = function (key) {
			reference.splice(reference.indexOf(key), 1);
			delete cache[key];
			// BAM!
		};

		this.get = function (key) {
			if (cache[key]) {
				return cache[key];
			}
			return null;
		};

		__self__.load();
	};
	// Static properties
	Cache.caches = new Array();
	Cache.canSave = true;

	// Extras
	if (!window.localStorage) {
		Cache.canSave = false;
		clearTimeout(timer);
		_openconsole.warn('Local Storage is not supported');
	}
})();