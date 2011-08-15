/* This is our model.  She is very skinny.  She only eats napkins. */

(function __SocialRadio__() {
	if (!window.apps) {
		apps = new Object();
	}

	// For testing purposes:
	settings.scripts.locations['tests.RadioService'] = '/SocialRadio/Service/DummyService.js';
	ScriptLoader.requireScript('apps.SocialRadio', 'io.Cache', 'services.Ajax', 'events.EventDispatcher', 'tests.RadioService', function () {

		/*  Once the scripts are ready, we initialize our model -- We should change this to inherit a server-push model */
		var SocialRadio = apps.SocialRadio = new (function SocialRadio() {
			var __self__ = this;

			// INHERITANCE
			this.inheritFrom = events.EventDispatcher;
			this.inheritFrom();
			delete this.inheritFrom;

			// EVENT CONSTANTS
			this.ON_CHANNEL_CHANGE = 'channelChange';
			this.ON_DATA_RECEIVED = 'dataReceived';

			var SERVER_URL = '/SocialRadio/Service/SRadioService.asmx/FetchPayload'; // webservice
			var CYCLE_INTERVAL = 5000; //500; // in milliseconds -- The fastest interval between server requests is half a second :)
			// **NOTE** this is an approximation.  Cycle won't begin the wait for the next "CYCLE_INTERVAL" until data the from
			// the server is reveived as per requested by the previous request.


			// **_____AUTO-CYCLE_____**
			var autoCycle = {};
			// Stores functions to be called every n(CYCLE_INTERVAL), where n is some positive integer.


			//
			// **_____VARIABLES_____**
			//var loggedIn = SN.SessionMember.isLoggedIn(); // Yarr!  **NOTE** We must remember to keep track of this.  Could be buggy, yo.
			var lastUpdate = 0; // The ID of the latestUpdate we received.  This is used to communicate with the server
			var channelName = 'all'; // The currently used channel
			var cycleCounter = 0;
			var nextRequest = {}; // Here we store what is to be called upon next server request with options
			var getDataTimer;
			//
			// MODELS
			var radioCache = new io.Cache('SongCache', 50);
			var userCache = new io.Cache('MemberCache', 50, false); // We need not save this one to the hard drive
			var music; // Load music model
			//


			//
			// **_____PRIVATE FUNCTIONS_____**
			var appendVal = function (methodName, val) {
				var getRequest;
				if (!nextRequest[methodName]) {
					getRequest = nextRequest[methodName] = new Array();
				} else {
					getRequest = nextRequest[methodName];
				}
				getRequest[getRequest.length] = val;
			};

			var fetchData = function () {
				// We need to add whatever resides in the 
				// autoCycle to the nextRequest object
				_openconsole.debug('Auto-cycle registrants:', size);
				for (var name in autoCycle) {
					if (cycleCounter % autoCycle[name].interval == 0) {
						autoCycle[name].execute();
					}
				}
				// all auto-cycling functions whose turn it is to execute have executed.

				// Lastly, we cycle through each request and append it to an array titled FetchOptions
				var options = new Array();

				for (var request in nextRequest) {
					options[options.length] = request;
				}

				nextRequest['FetchOptions'] = options;
				options = null;
				delete options;
				// BAM!

				// Now, let's grab the request object we have compiled for ourselves.
				var request = { 'opt': nextRequest };
				nextRequest = {}; // We clear it for next/requests that are being appended.... NOW

				_openconsole.debug('Sending:', $.toJSON(request));
				if (true) {
					// this is the Ajax call.  Need to replace with dummy data.
					services.Ajax.exchangeJSON(SERVER_URL, $.toJSON(request), function (e) {
						e = e.d;

						__self__.dispatchEvent(__self__.ON_DATA_RECEIVED, { 'data': e });

						/* DISPATCH EVENTS -- We also need to store things into the cache */
						for (var event in e) {
							// If we need to do any maintenance (i.e. caching, we can do it here, no?)

							// WARNING: this is not a scalable approach.  Create ServerDispatcher and have this inherit it!
							switch (event) {
								case "LastUpdateIndex":
									lastUpdate = e[event]; // Nice... this should work :)
									break;
							}

							__self__.dispatchEvent(event, {
								'data': e[event]
							});
						}


						cycleCounter++; // Increments the number of requests we have performed.
						_openconsole.debug('Cycles thus far', cycleCounter);
						getDataTimer = setTimeout(fetchData, CYCLE_INTERVAL);
					});
				} else {
					_openconsole.warn('We have disabled AJAX calls at the moment');
					// Here we need to grab dummy data
					request = tests.DummyService.submit(request);

					_openconsole.debug('Receiving', request.toString());
					/* DISPATCH EVENTS -- We also need to store things into the cache */
					for (var event in request) {

						__self__.dispatchEvent(event, {
							'data': request[event]
						});
						/**/

					}


					cycleCounter++; // Increments the number of requests we have performed.
					_openconsole.debug('Cycles thus far', cycleCounter);
					getDataTimer = setTimeout(fetchData, CYCLE_INTERVAL);
				}
			};
			//

			//
			// **_____API_____** -- (all methods from EventDispatcher are inherited)
			this.fetchSong = function (id) {
				appendNumber('FetchSong', id);
			};

			this.fetchListener = function (profileName) {
				appendNumber('FetchListener', profileName);
			};

			this.changeSongPlaying = function (id) {
				nextRequest['ChangeSongPlaying'] = id;
			};

			this.fetchListeners = function (optionsObj) {
				nextRequest['FetchListeners'] = optionsObj;
			};

			this.fetchMemberPlaylist = function (profileName) {
				nextRequest['FetchMemberPlaylist'] = profileName;
			};

			this.fetchChannelPlaylist = function (channelName) {
				nextRequest['FetchChannelPlaylist'] = channelName;
			};

			this.fetchNotifications = function () {
				nextRequest['FetchNotifications'] = true;
			};

			this.fetchActivity = function () {
				nextRequest['FetchActivity'] = {
					'ChannelName': channelName,
					'LastUpdate': lastUpdate
				};
			};


			this.openChannelPlaylist = function (newChannel) {
				if (newChannel == channelName) {
					return;
				}
				channelName = newChannel;
				__self__.fetchChannelPlaylist(newChannel);
				__self__.dispatchEvent(__self__.ONCHANNEL_CHANGE, {
					'PlaylistType': 'channel',
					'Name': newChannel
				});
			};

			this.addCycle = function (name, FN, interval) {
				// Here, we add a function to be called at some interval of interval(CYCLE_INTERVAL), where interval is some positive integer
				autoCycle[name] = {
					'execute': FN,
					'interval': interval
				};
			};

			this.removeCycle = function (name) {
				if (autoCycle[name]) {
					delete autoCycle[name];
					return;
				}
				_openconsole.warn('Removal of cycle named', name, 'which does not exist');
			};

			this.pause = function () {
				clearTimeout(getDataTimer);
				getDataTimer = null;
			};

			this.resume = function () {
				if (!getDataTimer) {
					fetchData();
				}
			};

			this.start = function () {
				__self__.resume();
			};
		})();

	});
})();