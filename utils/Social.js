(function() {
	if (!window.utils) {
		utils = new Object();
	}
	
	utils.Social = new (function Social() {
		var __self__ = this;
		
		var processUrl = function(url, absolute) {
			if (!absolute && url.indexOf(window.location.host) != -1) {
				absolute = true;
			}
			return !absolute ? (window.location.protocol + "//" + window.location.host + url) : url;
		};
		
		this.share = function(relativeUrl, title, absolute) {
			var f = "http://www.facebook.com/share";
			var e = encodeURIComponent;
			var p = ".php?t=" + e(title ? title : window.document.title) + "&u=" + e(processUrl(relativeUrl, absolute));
			
			__self__.a = function () {
				if (!window.open(f + ("r" + p), "sharer", "toolbar=0,status=0,resizable=1,width=1024,height=640")) {
					document.location.href = f + p;
				}
			};
			
			if (/Firefox/.test(navigator.userAgent)) {
				setTimeout("utils.Social.a()", 0);
			} else {
				__self__.a();
			}
			void 0;
		};
		
		this.tweet = function(relativeUrl, title, prefix, absolute) {
			var link = "http://twitter.com/home?status=" + encodeURIComponent((prefix ? prefix + " " : "") + (title ? title : window.document.title) + " " + processUrl(relativeUrl, absolute));
			__self__.b = function() {
				if (!window.open(link, "tweeter", "toolbar=0,status=0,resizable=1,width=626,height=500")) {
					document.location.href = link;
				}
			};
			
			if (/Firefox/.test(navigator.userAgent)) {
				setTimeout("utils.Social.b()", 0);
			} else {
				__self__.b();
			}
			void 0;
		};
		
	})();
	
})();