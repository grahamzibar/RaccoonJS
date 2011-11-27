if (window.HTMLElement)
	return;

if (!window.utils) {
	utils = new Object();
}

if (!utils.extensions) {
	utils.extensions = new Object();
}

window.HTMLElement = utils.extensions.IEHTMLElement = new (function() {
	var __self__ = this;
	this.prototype = new Object();
	
	var applyPrototype = function(obj) {
		var proto = __self__.prototype;
		for (var fn in proto) {
			obj[fn] = proto[fn];
		}
	};
	
	var traverse = function(parent) {
		applyPrototype(parent);
		var children = parent.childNodes;
		var size = children.length;
		for (var i = 0; i < size; i++) {
			var child = children[i];
			if (child.nodeType == Node.ELEMENT_NODE) {
				traverse(child);
			}
		}
	};
	
	this.extension_calibrate = function() {
		traverse(document.getElementsByTagName('body')[0]);
	};
	
	this.dispose = function() {
		var removePrototype = function(obj) {
			var proto = __self__.prototype;
			for (var fn in proto) {
				delete obj[fn];
			}
		};
		
		var traverse = function(parent) {
			removePrototype(parent);
			var children = parent.childNodes;
			var size = children.length;
			for (var i = 0; i < size; i++) {
				var child = children[i];
				if (child.nodeType == Node.ELEMENT_NODE) {
					traverse(child);
				}
			}
		};
		
		traverse(document.getElementsByTagName('body')[0]);
		
		delete window.HTMLElement;
	};
})();