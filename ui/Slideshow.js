/* ui.Slideshow */

ScriptLoader.requireScript('ui.Slideshow', 'extensions.Document', 'extensions.DOMTweener', function() {
	if (!window.ui) {
		ui = new Object
	}
	
	/* I should have a myriad of static animation functions to choose from... */
	
	var Slideshow = ui.Slideshow = function Slideshow(container, slides, links) {
		var __self__ = this;
		
		var timer = false;
		var currentSlide = 0;
		var totalSlides = slides.length;
		
		(function() {
			for (var i = 0; i < totalSlides; i++) {
				slides[i].setStyle('opacity', 0);
			}
			if (container.parentNode.getStyle('opacity') == 0) {
				container.parentNode.tween('opacity', { 'to': 100 });
			}
			var totalLinks = links.length;
			for (i = 0; i < totalLinks; i++) {
				links[i].slideshow_index = i + 1;
				links[i].onclick = function(e) {
					__self__.gotoSlide(this.slideshow_index);
					events.preventDefaults(e);
					return false;
				};
			}
		})();
		
		// this should be plug-and-play modular.
		var animate = function(to, from) {
			if (from > -1) {
				slides[from].tween('opacity', { 'to': 0 });
				links[from].className = '';
			}
			links[to].className = 'active';
			slides[to].tween('opacity', { 'to': 100 });
			container.tween('width', { 'to': slides[to].width, 'unit': 'px' });
			container.tween('height', { 'to': slides[to].height, 'unit': 'px' });
		};
		
		this.gotoSlide = function(slideNum) {
			if (slideNum < 1 || slideNum > totalSlides) {
				return;
			}
			animate(slideNum - 1, currentSlide - 1);
			currentSlide = slideNum;
		};
		
		this.nextSlide = function() {
			__self__.gotoSlide(currentSlide < totalSlides ? currentSlide + 1 : 1);
		};
		
		this.prevSlide = function() {
			__self__.gotoSlide(currentSlide == 1 ? totalSlides : currentSlide - 1);
		};
		
		this.start = function() {
			if (timer) {
				return;
			}
			timer = setInterval(__self__.nextSlide, 3000);
		};
		
		this.pause = function() {
			if (!timer) {
				return;
			}
			clearInterval(timer);
			timer = false;
		};
		
		events.addHandler(document, 'onmousemove', function(e) {
			var containerXY = container.getXY();
			var mouseXY = document.getMouseXY(e);
			var offsetX = mouseXY.posX - containerXY.posX;
			var offsetY = mouseXY.posY - containerXY.posY;
			if (timer && offsetX > 0 && offsetY > 0 && offsetX < container.offsetWidth && offsetY < container.offsetHeight) {
				__self__.pause();
			} else if (!timer) {
				__self__.start();
			}
		});
		
		this.nextSlide();
		this.start();
	};
	/* This is a static function which parses the page by the specified attributes.  It ONLY searches divs */
	Slideshow.slideSelector = function(searchArea, containerClassName, maskClassName, controlsClassName) {
		var slideshows = searchArea.search('div', 'className', containerClassName);
		var numOfShows = slideshows.length;
		for (var i = 0; i < numOfShows; i++) {
			var container = slideshows[i];
			var mask = container.search('div', 'className', maskClassName)[0];
			var controls = container.search('div', 'className', controlsClassName)[0].getElementsByTagName('a');
			slideshows[i] = new Slideshow(mask, mask.getElementsByTagName('img'), controls);
		}
		return slideshows;
	};
});