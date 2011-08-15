/* Template JavaScript! */

if (!window.ui) {
	ui = new Object();
}

/*
	Delim is how we cut everything up.  So if a property is called 'artistName' and
	we have a ':' as the delimeter, we should wrap it like such:
	
	<div class="nameDiv">:artistName:</div>
	
	So, when we want to use our template, call .get(properties) where properties
	is an object with the value for the 'artistName' property as so:
	
	{
		'artistName': value
	}
	
 */
ui.Template = function Template(markup, delim) {
	if (typeof markup == 'object') {
		markup = markup.innerHTML;
	}
	markup = unescape(markup);
	// We will optimize now :)
	markup = markup.split(delim);
	var size = markup.length;

	// Now markup is an array of string values.  Every OTHER string is to be replaced by the property name
	this.get = function (properties) {
		var rry = markup;
		var length = size;
		var returnMarkup = '';
		for (var i = 0; i < size; i++) {
			if (i % 2 != 0) {
				returnMarkup += properties[rry[i]];
			} else {
				returnMarkup += rry[i];
			}
		}
		delete length;
		delete rry;
		return returnMarkup;
	};
};