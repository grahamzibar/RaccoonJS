/* ui.PlayerControls */

ScriptLoader.requireScript('ui.PlayerControls', 'apps.Player', 'extensions.Document', 'extensions.DOMTweener', function() {
	
	if (!window.ui) {
		ui = new Object();
	}
	
	// Build this one like ui.ScrollPane :)
	ui.PlayerControls = function PlayerControls() {
		/*var player = apps.Player;
				
		// Control Variables -- I need to wrap the following into a ui.MusicPlayer class.  It'll make things much easier!
		// I will even upgrade The art of re use!
		
		var currentTime = document.getElementById('currentTime');
		var totalTime = document.getElementById('totalTime');
		var trackTitle = document.getElementById('trackTitle');
		var trackNumber = document.getElementById('trackNum');
		
		var playBtn = document.getElementById('playBtn');
		var nextBtn = document.getElementById('nextBtn');
		var previousBtn = document.getElementById('prevBtn');
		
		var loadingBar = document.getElementById('loadingBar');
		var progressBar = document.getElementById('progressBar');
		var barSize = progressBar.parentNode.offsetWidth;
		
		// Next, let's parse the data and create a playlist.
		var playlist = data.tracks;
		for (var i = 0; i < playlist.length; i++) {
			playlist[i].url = playlist[i].streaming_url;
		}
		
		player.addEventListener('ontrackrequest', function(e) {
			var index = player.getSongIndex();
			var track = playlist[index];
			trackNumber.innerHTML = (index + 1) + '.';
			trackTitle.innerHTML = track.title;
		});
		
		var isPlaying = false;
		
		player.addEventListener('ontrackplay', function(e) {
			isPlaying = true;
			var curr = player.getTrackTime().split('/');
			currentTime.innerHTML = curr[0];
			totalTime.innerHTML = curr[1];
			
			progressBar.style.width = (e.progress / 100 * barSize) + 'px';
		});
		
		player.addEventListener('ontrackdownload', function(e) {
			if (!isPlaying) {
				var curr = player.getTrackTime().split('/');
				currentTime.innerHTML = curr[0];
				totalTime.innerHTML = curr[1];
			}
			loadingBar.tween('width', { 'to': e.progress / 100 * barSize, 'unit': 'px' });
		});
		
		player.addEventListener('ontrackresume', function(e) {
			playBtn.onclick = function() {
				player.pause();
				return false;
			};
			playBtn.className = 'pauseBtn';
		});
		
		player.addEventListener('ontrackpause', function(e) {
			isPlaying = false;
			playBtn.onclick = function() {
				player.play();
			};
			playBtn.className = 'playBtn';
		});
		
		player.addEventListener('onload', function(e) {
			player.loadPlaylist(playlist);
		});
		
		player.addEventListener('onfail', function(e) {
			//
		});
		
		playBtn.onclick = function() {
			player.play();
			return false;
		};
		nextBtn.onclick = function() {
			player.nextTrack();
			return false;
		};
		previousBtn.onclick = function() {
			player.previousTrack();
			return false;
		};
		progressBar.onclick = loadingBar.onclick = function() {
			var perc = (document.getMouseXY(e).posX - loadingBar.getXY().posX) / barSize;
			player.seekTo(perc * 100);
			progressBar.style.width = (perc * barSize) + 'px';
			return false;
		};
		
		player.init('eatMe');*/
	};
	
});