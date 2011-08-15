(function __BaseController__() {


	var BaseController = function BaseController(view, model) {
		var __self__ = this;

		this.getView = function () {
			return view;
		};

		this.getModel = function () {
			return model;
		};

		/* Up to the inheriter to attach the appropriate listeners to objects in the view and to events from the model */

		// Up to inheriter to implement.  Left as empty function so it can be called if necessary by an external source to force a refresh.
		this.refresh = function () {
		};

		// More functions can be added later if applicable

	};

})();