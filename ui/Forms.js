/* Form scripts */

if (!window.ui) {
	ui = new Object();
}

ui.Forms = new (function Forms() {
	
	this.addFocus = function(inputs, focusClassName, blurClassName) {
		var size = inputs.length;
		for (var i = 0; i < size; i++) {
			var obj = inputs[i];
			obj.storedValue = obj.value;
			obj.onfocus = function() {
				if (!this.storedValue) {
					this.storedValue = this.value;
				} else if (this.value != this.storedValue) {
					return;
				}
				this.className = focusClassName;
				this.value = '';
			};
			obj.onblur = function() {
				if (this.value == '') {
					this.value = this.storedValue;
					this.className = blurClassName;
				}
			};
		}
	};
	
	this.loginform = function() {
	};
	
})();