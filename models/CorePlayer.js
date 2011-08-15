/* CorePlayer */
if (!window.models) {
	models = new Object();
}


models.CorePlayer = function (audio) {
	var home = this;
	var audio = audio ? audio : null;
	var currentTrack = null;

	var NOT_STARTED = -1;
	var DOWNLOADING = 0;
	var DOWNLOADED = 1;

	var setupListeners = function () {
		audio.addEventListener("loadstart", function () {
			currentTrack.downloadStatus = DOWNLOADING;
		});
		audio.addEventListener("loadeddata", function () {
			currentTrack.downloadStatus = DOWNLOADED;
		});
	};

	if (audio) {
		setupListeners();
	}

	var unLoad = function () {
		if (audio) {
			audio.pause();
		}
		currentTrack = null;
	};

	this.getTrackUrl = function () {
		return currentTrack ? currentTrack.url : '';
	};

	this.resume = function () {
		if (audio) {
			audio.play();
		}
	};

	this.pause = function () {
		if (audio) {
			audio.pause();
		}
	};

	this.playTrack = function (url) {
		home.loadTrack(url, true);
	};

	this.loadTrack = function (url, autoPlay) {
		unLoad();
		currentTrack = { 'url': url, 'downloadStatus': NOT_STARTED };
		if (!audio) {
			audio = new Audio();
			_openconsole.debug('Creating audio object');
			setupListeners();
		}
		if (autoPlay) {
			audio.autoplay = true;
		} else {
			audio.autoplay = false;
		}
		audio.src = currentTrack.url;
		_openconsole.info('Loading url:', audio.src);
		audio.load();
	};

	var getTotalTime = function () {
		if (!audio || currentTrack.downloadStatus == NOT_STARTED) {
			return 0;
		}
		if (currentTrack.downloadStatus == DOWNLOADED) {
			return audio.duration;
		}
		try {
			return audio.duration >= audio.seekable.end() ? audio.duration : audio.seekable.end();
		} catch (e) {
			return 0;
		}
	};

	this.getLoadProgress = function () {
		if (!audio || !currentTrack || currentTrack.downloadStatus == NOT_STARTED) {
			return 0;
		}
		if (currentTrack.downloadStatus == DOWNLOADED) {
			return 100;
		}
		try {
			return Math.round((audio.buffered.end() / getTotalTime()) * 100);
		} catch (e) {
			return 0;
		}
	};

	this.seekTo = function (percent) {
		if (audio) {
			audio.currentTime = (percent / 100) * getTotalTime();
		}
	};

	this.getTrackProgress = function () {
		if (audio) {
			return Math.round((audio.currentTime / getTotalTime()) * 100);
		}
		return 0;
	};

	var getTimeString = function (ms) {
		var ms_m = 60;
		var ms_s = 1;

		var minutes = Math.floor(ms / ms_m);
		minutes = minutes < 10 ? "0" + minutes : minutes;
		var seconds = Math.floor((ms % ms_m) / ms_s);
		seconds = seconds < 10 ? "0" + seconds : seconds;
		return minutes + ":" + seconds;
	};

	this.getTrackTime = function () {
		if (!audio) {
			return "00:00/00:00";
		}
		return getTimeString(audio.currentTime) + "/" + getTimeString(getTotalTime());
	};

	this.setVolume = function (percent) {
		if (audio) {
			audio.volume = percent / 100;
		}
	};

	this.getVolume = function () {
		if (!audio) {
			return 100;
		}
		return audio.volume;
	};
};