ScriptLoader.loadScript('com.apple.AC_QuickTime', function() {
	ScriptLoader.requireScript('__main__', 'models.QuickTimePlayer', function() {
		document.getElementById(flashID).parentNode.innerHTML = QT_WriteOBJECT(settings['scripts']['locations']['default'] + 'models/Silence.mp3', '1', '1', '', 'EnableJavaScript', 'True', 'postdomevents', 'True', 'emb#NAME', flashID, 'obj#id', flashID);
		// Now, we make sure javascript is ready for our use!
		var qtObj = document[flashID];
		qtObj.addEventListener('qt_begin', function handler() {
			qtObj.removeEventListener('qt_begin', handler, false);
			model = new models.QuickTimePlayer(qtObj);
			home.dispatchEvent('oninit');
			mode = 'QuickTime';
			home.onready(true);
			// And that should be good!
		}, false);
	});
});