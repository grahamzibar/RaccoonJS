/* Ajax requests :) */
(function __Ajax__() {
	if (!window.services) {
		services = new Object();
	}

	var Ajax = services.Ajax = new (function Ajax() {
		var __self__ = this;

		var CHAR_SET = this.CHAR_SET = 'UTF-8';
		var FORM = this.FORM = 'application/x-www-form-urlencoded'; // This is default
		var JSON = this.JSON = 'application/json';
		/* Add more if need be */

		var createXMLHttp = function () {
			var xmlhttp;
			if (typeof XMLHttpRequest != 'undefined') {
				try {
					xmlhttp = new XMLHttpRequest();
				} catch (e) {
					xmlhttp = false;
				}
			}
			if (!xmlhttp && window.createRequest) {
				try {
					xmlhttp = window.createRequest();
				} catch (e) {
					xmlhttp = false;
				}
			}
			if (!xmlhttp) {
				alert("Your browser does not support AJAX Technology.  Stop being a dinosaur!!");
			}
			return xmlhttp;
		};

		var easyCall = function (url, callback, postVars, noCacheKiller, contentType) {
			var __self__ = __self__; // Keep this var within scope as to avoid leaving the scope to find __self__
			var ajaxObj = createXMLHttp();
			noCacheKiller = (noCacheKiller) ? "" : ((url.indexOf('?') == -1) ? "?" : "&") + "rand=" + Math.random();
			if (!contentType) {
				contentType = FORM;
			}
			ajaxObj.open((postVars) ? "POST" : "GET", url + noCacheKiller, true);
			ajaxObj.onreadystatechange = function () {
				if (ajaxObj.readyState == 4 && callback) {
					callback(ajaxObj);
				}
			};
			if (postVars) {
				ajaxObj.setRequestHeader("Content-Type", contentType + "; charset=" + CHAR_SET);
				ajaxObj.send(postVars);
			} else {
				ajaxObj.send(null);
			}
		};

		this.getResponse = function (url, callback, postVars, noCacheKiller, contentType) {
			easyCall(url, function (obj) {
				callback(obj.responseText);
			}, postVars, noCacheKiller, contentType);
		};

		this.getXML = function (url, callback, postVars, noCacheKiller, contentType) {
			easyCall(url, function (obj) {
				var xml;
				try {
					xml = obj.responseXML.documentElement;
				} catch (e) {
					xml = null;
				}
				callback(xml);
			}, postVars, noCacheKiller, contentType);
		};

		this.getJSON = function (url, callback, postVars, noCacheKiller, contentType) {
			easyCall(url, function (obj) {
				callback(eval('(' + obj.responseText + ')'));
			}, postVars, noCacheKiller, contentType);
		};

		this.exchangeJSON = function (url, JSON, callback) {
			__self__.getJSON(url, callback, JSON, false, __self__.JSON);
		};

	})();
})();