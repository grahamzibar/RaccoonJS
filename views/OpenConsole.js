/* Console View */
// We are going to change this a bit... we also need to hook into the IE console a bit better.  Thus, we need to distinguish from
// IE 8, 9, 7, etc... sounds like a daunting task!  What can we do in the interim?
if (!window.views) {
	views = new Object();
}

ScriptLoader.requireScript('views.OpenConsole', 'ui.Template', 'extensions.Elements', 'events.Keys', 'extensions.Keys', 'extensions.DOMTweener',
function() {
	var OpenConsole = views.OpenConsole = new (function OpenConsole() {
		var __self__ = this;
		
		// CONSTANTS
		var CONSOLE_HEIGHT = 250;
		
		// DOM properties
		var domObject = document.createElement('div');
		var logTemplate = new ui.Template('<div class=":methodName:">:arguments:</div>', ':');
		var open = false;
		
		var commands = {};
		
		// Here, we create the structure of our console and the important styles
		(function() {
			domObject.applyStyle({
				'position': utils.Browser.isIE ? 'static' : 'fixed',
				'background-color': '#252525',
				'color': '#FFFFFF',
				'left': '0px',
				'top': '0px',
				'width': '100%', // These should be reviewed
				'height': '0px',
				'overflow': 'hidden !important', // VERY important
				'font-family': 'Monospace',
				'font-size': '13px',
				'letter-spacing': '1px',
				'text-align': 'left'
			});
			domObject.setStyle('opacity', 0);
			domObject.id = 'OpenConsole';
			
			// 1) we add two elements.  The first being a div with overflow:scroll;
			var output = document.createElement('div');
			output.id = 'OpenConsole_output';
			output.applyStyle({
				'padding': '10px',
				'overflow': 'auto',
				'margin-bottom': '10px',
				'max-height': (CONSOLE_HEIGHT - 60) + 'px',
				'font-family': 'Monospace',
				'font-size': '13px',
				'letter-spacing': '1px'
			});
			
			var input = document.createElement('input');
			input.id = 'OpenConsole_input';
			input.applyStyle({
				'padding': '5px 10px',
				'background-color': '#252525',
				'color': '#FFFFFF',
				'height': '12px',
				'width': '90%',
				'border': 'none',
				'outline': 'none',
				'font-family': 'Monospace',
				'font-size': '13px',
				'letter-spacing': '1px'
			});
			
			var arrow = document.createElement('span');
			arrow.innerHTML = '&nbsp;&gt;&nbsp;';
			
			domObject.appendChild(output);
			domObject.appendChild(arrow);
			domObject.appendChild(input);
			
			if (utils.Browser.isIE) {
				document.body.insertBefore(domObject, document.body.childNodes[0]); // Done!
			} else {
				document.body.appendChild(domObject); // Done!
			}
			
			// There might be a better to do this to avoid memory leakage!
			input.addKeyListener({
				'down': function(e) {
					if (events.Keys.isEnter(e)) {
						_openconsole.log('<br />');
						var val = new String(input.value);
						_openconsole.log('&gt;', val.toString());
						// First, we split the string up by spaces and if the first object is in the command-line
						var splitted = val.split(' ');
						if (commands[splitted[0]]) {
							// Since we have that commands, we pass splitted without the name into the function as the argument.
							commands[splitted[0]](splitted.slice(1));
						} else {
							delete splitted;
							// Here, we evaluate our code and display what it returns :)
							try {
								_openconsole.log(eval(val.toString()));
							} catch (e) {
								_openconsole.error(e);
							}
						}
						input.value = '';
					} else {
						input.value = input.value; // force refresh for IE?
					}
				}
			});
			
			arrow = null;
		})();
		
		this.show = function() {
			var tweener = domObject.tween('height', { 'to': CONSOLE_HEIGHT, 'unit': 'px', 'speed': 2, 'timingFunction': 'ease-out' });
			tweener.addEventListener('complete', function(e) {
				input.value = '';
				tweener.removeEventListener(e.listener);
			});
			domObject.tween('opacity', { 'to': 80, 'speed': 1, 'timingFunction': 'ease-out' });
			var input = document.getElementById('OpenConsole_input');
			input.focus();
			open = true;
		};
		
		this.hide = function() {
			domObject.tween('height', { 'to': 0, 'unit': 'px', 'speed': 2, 'timingFunction': 'linear' });
			domObject.tween('opacity', { 'to': 0, 'speed': 0.5, 'timingFunction': 'ease' });
			var input = document.getElementById('OpenConsole_input');
			input.blur();
			input.value = '';
			open = false;
		};
		
		// This should really be accepting an object.  The object then has built-in help, etc...
		this.addCommand = function(name, func) {
			if (commands[name]) {
				_openconsole.warn('Already a command with name', '"' + name + '"', 'loaded.');
				return;
			}
			//_openconsole.info(name, 'loaded into command-line.');
			commands[name] = func;
		};
		
		this.removeCommand = function(name) {
			if (!commands[name]) {
				_openconsole.warn('No command named', '"' + name + '"', 'to unload.');
				return;
			}
			//_openconsole.info(name, 'unloaded from command-line.');
			delete command[name];
		};
		
		this.notifyOpenConsole = function(arguments, methodName) {
			var val = '';
			for (var index in arguments) {
				val += arguments[index];
				val += ' ';
			}
			document.getElementById('OpenConsole_output').innerHTML += logTemplate.get({
				'methodName': methodName,
				'arguments': val
			});
		};
		
		// Now, we listen to stuff!!
		if (!_openconsole.isOpenConsole) {
			initConsole();
		}
		
		try {
			console = _openconsole;
		} catch (e) {
			// ?? 
		}
		
		(function() {
			var data = _openconsole.dump();
			for (var i = 0; i < data.length; i++) {
				__self__.notifyOpenConsole(data[i].data, data[i].type);
			}
		})();
		
		_openconsole.onnotify = function(cache) {
			__self__.notifyOpenConsole(cache.data, cache.type);
		};
		
		// If we press `/~, we should toggle the show/hide thingy :)
		events.Keys.addKeyListener({
			'down': function(e) {
				//alert(events.Keys.getCharCode(e));
				if (events.Keys.checkCharCode(e, 192)) { // TODO**
					events.preventDefaults(e);
					if (open) {
						__self__.hide();
					} else {
						__self__.show();
					}
				}
			}
		});
		
		this.addCommand('apps', function(args) {
			if (args.length) {
				_openconsole.log('[', args.join(', '), ']');
			}
			var rtrn = '';
			for (var cmd in commands) {
				if (cmd == 'apps') {
					continue;
				}
				rtrn += cmd;
				if (commands[cmd].description) {
					rtrn += ' - ';
					rtrn += commands[cmd].description;
				}
				rtrn += '<br />';
			}
			_openconsole.log('Apps currently loaded:<br />', rtrn);
		});
		
		// And now we just prepare our OpenConsole message :)
		_openconsole.info('** Welcome to graham-robertson.ca **');
		_openconsole.info('<br />');
		_openconsole.info('Type a command. Example:');
		_openconsole.info('commandName argument argument2');
		_openconsole.info('<br />');
		_openconsole.info('For a list of apps, type "apps" into the command line.');
	})();
	
});