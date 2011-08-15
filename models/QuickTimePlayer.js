/* Interface for QuickTime :) */	
if (!window.models) {
	models = new Object();
}

models.QuickTimePlayer = function(audio) {
	var home = this;
	
	var currentTrack = null;

	var NOT_STARTED = -1;
	var DOWNLOADING = 0;
	var DOWNLOADED = 1;

	var setupListeners = function () {
		audio.addEventListener("qt_progress", function () {
			currentTrack.downloadStatus = DOWNLOADING;
		}, false);
		audio.addEventListener("qt_load", function () {
			currentTrack.downloadStatus = DOWNLOADED;
		}, false);
	};

	setupListeners();

	var unLoad = function () {
		audio.Stop();
		currentTrack = null;
	};

	this.getTrackUrl = function () {
		return currentTrack ? currentTrack.url : '';
	};

	this.resume = function () {
		audio.Play(); // Nice!
	};

	this.pause = function () {
		audio.Stop();
	};

	this.playTrack = function (url) {
		home.loadTrack(url, true);
	};

	this.loadTrack = function (url, autoPlay) {
		unLoad();
		currentTrack = { 'url': url, 'downloadStatus': NOT_STARTED };
		if (autoPlay) {
			audio.SetAutoPlay(true);
		} else {
			audio.SetAutoPlay(false);
		}
		audio.SetURL(currentTrack.url);
		_openconsole.info('Loading url:', audio.GetURL());
	};

	var getTotalTime = function () {
		if (currentTrack.downloadStatus == NOT_STARTED) {
			return 0;
		}
		return audio.GetDuration();
	};

	this.getLoadProgress = function () {
		if (!currentTrack || currentTrack.downloadStatus == NOT_STARTED) {
			return 0;
		}
		if (currentTrack.downloadStatus == DOWNLOADED) {
			return 100;
		}
		var duration = getTotalTime();
		if (duration == 0) {
			return 0;
		}
 		return (audio.GetMaxTimeLoaded() / duration) * 100;
	};

	this.seekTo = function (percent) {
		audio.SetTime((percent / 100) * getTotalTime());
	};

	this.getTrackProgress = function () {
		return Math.round((audio.GetTime() / getTotalTime()) * 100);
	};

	var getTimeString = function (ms) {
		ms = ms / 1000;
		var ms_m = 60;
		var ms_s = 1;

		var minutes = Math.floor(ms / ms_m);
		minutes = minutes < 10 ? "0" + minutes : minutes;
		var seconds = Math.floor((ms % ms_m) / ms_s);
		seconds = seconds < 10 ? "0" + seconds : seconds;
		return minutes + ":" + seconds;
	};

	this.getTrackTime = function () {
		if (currentTrack.downloadStatus == NOT_STARTED) {
			return "00:00/00:00";
		}
		return getTimeString(audio.GetTime()) + "/" + getTimeString(getTotalTime());
	};

	this.setVolume = function (percent) {
		audio.SetVolume((percent / 100) * 255); // 0 - 255
	};

	this.getVolume = function () {
		return audio.GetVolume();
	};
};