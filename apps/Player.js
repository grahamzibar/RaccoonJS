if (!window.apps) {
    apps = new Object();
}

ScriptLoader.requireScript('apps.Player', 'events.EventDispatcher', 'utils.Browser', function () {
	/* A JavaScript Control wrapper which handles the dispatching of Music related events */
	//
	/* Song Events: */
	// - ontrackrequest (when a track has been requested)
	// - ontrackdownload (when a track is being downloaded)
	// - ontrackbuffered (when a track has finished buffering)
	// - ontrackloaded (when a track has finished downloading :D)
	// - ontrackplay (when a track is playing :D)
	// - ontrackpause (when a track is paused)
	// - ontrackcomplete (when a track has finished playing)
	//
	/* Playlist Event */
	// - ontrackqueue (when a song form the playlist has been queued for playing)
	//
	/* Load Events: */
	// - oninit (when the player begins to intialize)
	// - onload (when the player has finished loading)
	// - onfail (Neither HTML5 compatible nor do we have flash... so just ask user to download flash)
	//
	apps.Player = new (function Player() {
		this.inheritFrom = events.EventDispatcher;
		this.inheritFrom();
		delete this.inheritFrom;

		var home = this;

		var model = null;
		
		var firstRun = true;
		var hackIOS = false;

		var playlist = null;
		var currentSongIndex = 0;

		var request = '';
		var isPlaying = false;
		var isBuffered = false;
		var isDownloaded = false;

		var pauseStatus = false;

		var playTimer = null;
		var playTimerInterval = null;

		this.getCurrentTrackID = this.getCurrentTrackUrl = function () {
			// We will need to modify this...
			if (!model) {
				return '';
			}
			return model.getTrackUrl();
		};

		var stopPlayTimer = function () {
			if (playTimerInterval != null) {
				clearTimeout(playTimerInterval);
				playTimerInterval = null;
			}
		};

		var resetPlayTimer = function () {
			stopPlayTimer();
			playTimer = null;
		};

		var startPlayTimer = function () {
			if (playTimer == null || playTimerInterval == null) {
				playTimer = 0;
			}
			playTimerInterval = setInterval(function () {
				if (playTimer++ >= 10) {
					// after 10 seconds
					resetPlayTimer();
					home.dispatchEvent('ontrackregisterplayed');
				}
			}, 1000);
		};

		this.play = function () {
			if (isPlaying) {
				return;
			}
			if (!model) {
				request = 'play';
			} else if (hackIOS) {
				home.playTrack(hackIOS);
				hackIOS = false;
			} else if (!isBuffered) {
				request = 'play';
			} else {
				model.resume();
				isPlaying = true;
				home.dispatchEvent('ontrackresume');
			}
			startPlayTimer();
		};

		this.pause = function () {
			if (model && isPlaying) {
				if (!isBuffered) {
					request = 'pause';
				} else {
					model.pause();
					isPlaying = false;
					home.dispatchEvent('ontrackpause');
				}
				stopPlayTimer();
			}
		};
		
		var notifyTrack = function(url, autoPlay) {
			if (firstRun && utils.Browser.isIOS) {
				firstRun = false;
				hackIOS = url;
				//model.loadTrack(url);
				home.dispatchEvent('ontrackrequest', { 'trackID': url });
				home.dispatchEvent('ontrackpause', { 'trackID': url });
			} else {
				firstRun = false;
				if (autoPlay) {
					model.playTrack(url);
					isPlaying = true;
					home.dispatchEvent('ontrackresume', { 'trackID': url });
				} else {
					model.loadTrack(url);
				}
				isBuffered = false;
				isDownloaded = false;
				home.dispatchEvent('ontrackrequest', { 'trackID': url });
			}
		};

		this.playTrack = function (url) {
			if (!model || home.getCurrentTrackID() == url) {
				home.play();
				return;
			}
			notifyTrack(url, true);
			home.dispatchEvent('ontrackresume', { 'trackID': url });
			resetPlayTimer();
			startPlayTimer();
		};

		this.loadTrack = function (url) {
			if (!model) {
				return;
			}
			notifyTrack(url);
		};

		this.getLoadProgress = function () {
			if (!model) {
				return 0;
			}
			return model.getLoadProgress();
		};

		this.seekTo = function (perc) {
			if (!model) {
				return;
			}
			model.seekTo(perc);
		};

		this.getTrackProgress = function () {
			if (!model) {
				return 0;
			}
			var progress = model.getTrackProgress();
			if (!progress || progress == NaN) { // TODO: fix this!!
				return 0;
			}
			return progress;
		};

		this.getTrackTime = function () {
			if (!model) {
				return "00:00/00:00";
			}
			return model.getTrackTime();
		};

		this.setVolume = function (perc) {
			if (!model) {
				return;
			}
			model.setVolume(perc);
		};

		this.getVolume = function () {
			if (!model) {
				return 0;
			}
			return model.getVolume();
		};

		this.getSongIndex = function () {
			return currentSongIndex;
		};

		this.nextTrack = function () {
			if (playlist) {
				currentSongIndex = currentSongIndex < playlist.length - 1 ? currentSongIndex + 1 : 0;
				home.dispatchEvent('ontrackqueue', { 'data': playlist[currentSongIndex] });
				home.playTrack(playlist[currentSongIndex].url);
			}
		};

		this.previousTrack = function () {
			if (playlist) {
				currentSongIndex = currentSongIndex ? currentSongIndex - 1 : playlist.length - 1;
				home.dispatchEvent('ontrackqueue', { 'data': playlist[currentSongIndex] });
				home.playTrack(playlist[currentSongIndex].url);
			}
		};

		var playlistListener;
		this.loadPlaylist = function (listObj, autoPlay) {
			playlist = listObj;
			currentSongIndex = 0;
			playlistListener = home.addEventListener('ontrackcomplete', home.nextTrack);
			if (isPlaying || autoPlay) {
				home.playTrack(playlist[0].url);
			} else {
				home.loadTrack(playlist[0].url);
			}
		};

		this.unloadPlaylist = function () {
			playlist = null;
			currentSongIndex = 0;
			home.removeEventListener(playlistListener);
			playlistListener = null;
		};

		this.status = function () {
			// Here, we ask the model for its current state and then dispatch events accordingly :)
			if (!pauseStatus && isPlaying) {
				var time = home.getTrackProgress();
				home.dispatchEvent('ontrackplay', { 'time': home.getTrackTime(), 'progress': time });
				if (time == 100) {
					isPlaying = false;
					isDownloaded = false;
					isBuffered = false;
					home.dispatchEvent('ontrackcomplete', { 'trackID': home.getCurrentTrackID() });
				}
			}

			if (!isDownloaded) {
				var progress = home.getLoadProgress();
				if (progress) {
					home.dispatchEvent('ontrackdownload', { 'progress': progress });
					if (progress <= 100) {
						if (!isBuffered && progress > 10) {
							isBuffered = true;
							home.dispatchEvent('ontrackbuffered');
						}
						if (progress == 100) {
							isDownloaded = true;
							home.dispatchEvent('ontrackloaded');
						}
					}
				}
			}
		};

		this.pausePlayingStatus = function () {
			pauseStatus = true;
		};

		this.resumePlayingStatus = function () {
			pauseStatus = false;
		};

		this.init = function (flashID) {
			var mode = '';

			home.onready = function (bool) {
				_openconsole.info(mode, 'Audio Player loaded');
				_openconsole.info(mode, 'is fully loaded and dispatching the onload event.');
				home.dispatchEvent('onload', { 'type': mode });
				var timer = setInterval(home.status, 1000);
				home.onready = bool;
				_openconsole.info(home.onready);
			};

			if (utils.Browser.isWebkit) {
				var newScript = ScriptLoader.loadScript('models.CorePlayer', function () {
					model = new models.CorePlayer();
					home.dispatchEvent('oninit');
					mode = 'html5';
					home.onready(true);
				});
				var thisScript = ScriptLoader.library[ScriptLoader.convertToUrl('apps.Player')];
				thisScript.addDependency(newScript);
				newScript.addDependent(thisScript);
				thisScript = null;
				newScript = null;
				delete thisScript;
				delete newScript;
			} else {
				// Flash time! I should wrap the following for different projects :)
				var newScript = ScriptLoader.loadScript('com.google.swfobject', function () {
					swfobject.switchOffAutoHideShow(); // should be ok :)
					swfobject.embedSWF(settings['scripts']['locations']['default'] + "models/coreplayer.swf?rand=" + Math.random(), flashID, "1", "1", "10", "", {}, { "wmode": "transparent", "allowNetworking": "all", "allowScriptAccess": "always" }, {}, function (e) {
						if (e.success) {
							_openconsole.info('Flash embed successful');
							model = (utils.Browser.isIE) ? window[flashID] : document[flashID];
							if (!model) {
								model = document.getElementById(flashID);
							}
							if (utils.Browser.isFirefox) {
								model.parentNode.style.position = 'absolute';
								model.parentNode.style.bottom = 'none';
								model.parentNode.style.top = '0px';
							}
							home.dispatchEvent('oninit');
							mode = 'flash';
						} else {
							// Hmmm... why didn't this load?
							_openconsole.warn('Flash embed failed');
							home.onready = false;
							home.dispatchEvent('onfail');
						}
					});
					_openconsole.info('swfobject requested.');
				});
				var thisScript = ScriptLoader.library[ScriptLoader.convertToUrl('apps.Player')];
				thisScript.addDependency(newScript);
				newScript.addDependent(thisScript);
				thisScript = null;
				newScript = null;
				delete thisScript;
				delete newScript;
			}

			home.addEventListener('ontrackbuffered', function () {
				if (request == 'pause') {
					home.pause();
				} else if (request == 'play') {
					home.play();
				}
				request = '';
			});
		};
	})();

});