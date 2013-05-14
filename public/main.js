// -----
// Main.js
// Created 1/21/2012 by Grant Butler <gjb7@njit.edu>
// -----
// All the main code for the SmartDisplay is handled here. SmartDisplay.run is called when
// the window loads. From there, we load in all the scripts for the different pages, have
// them setup their views, add them to the DOM, and start going.
// 
// This file is broken up into several parts. First, we have helper functions. These are
// usually shortcuts for longer function names. Next, we have the SmartDisplay class. This
// manages the state of the overall display. When the page loads, SmartDisplay.sharedDisplay.run()
// is called, which creates instances of the other classes, and adds them to the DOM. Next
// is the ACMLogo class. All this does is manage a CSS version of the ACM logo. We do this
// to have an easy way to reset the elements when we perform transforms. Next is the
// ProgressIndicator class. This class controls the pie progress indicator in the top left
// corner of the display that acts as a countdown until the next page is displayed by the
// SmartDisplay. Finally, we have the TwitterTicker class. This class manages the ticker
// at the bottom of the screen that displays tweets.
// -----

// -----
// Helper functions
// -----

function $(/* String */ s) {
	return document.getElementById(s);
}

function $$(/* String */s) {
	return document.getElementsByClassName(s);
}

function $style(/* DOMElement */ e) {
	return window.getComputedStyle(e, null);
}

String.prototype.trim = function() {
	return this.replace(/^\s+|\s+$/g,"");
};

Date.prototype.toRelativeString = function() {
	var delta = (new Date() - this) / 1000;
	
	if(delta < 60) {
		return Math.round(delta) + ' seconds ago';
	} else if(delta < 60 * 60) {
		return Math.round(delta / 60) + ' minutes ago';
	} else if(delta < 60 * 60 * 24) {
		return Math.round(delta / 60 / 60) + ' hours ago';
	} else if(delta < 60 * 60 * 24 * 30) {
		return Math.round(delta / 60 / 60 / 24) + ' days ago';
	} else {
		var month = '';
		
		switch(this.getMonth()) {
			case 0:
				month = 'Jan';
				break;
			case 1:
				month = 'Feb';
				break;
			case 2:
				month = 'Mar';
				break;
			case 3:
				month = 'Apr';
				break;
			case 4:
				month = 'May';
				break;
			case 5:
				month = 'Jun';
				break;
			case 6:
				month = 'Jul';
				break;
			case 7:
				month = 'Aug';
				break;
			case 8:
				month = 'Sep';
				break;
			case 9:
				month = 'Oct';
				break;
			case 10:
				month = 'Nov';
				break;
			case 11:
				month = 'Dec';
				break;
		}
		
		return month + ' ' + this.getDate() + ' ' + this.getFullYear();
	}
};

// Creates a Class system for JavaScript. Thanks John Resig!
// http://ejohn.org/blog/simple-javascript-inheritance/
(function(){
  var initializing = false, fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;
  // The base Class implementation (does nothing)
  this.Class = function(){};
  
  // Create a new Class that inherits from this class
  Class.extend = function(prop) {
    var _super = this.prototype;
    
    // Instantiate a base class (but only create the instance,
    // don't run the init constructor)
    initializing = true;
    var prototype = new this();
    initializing = false;
    
    // Copy the properties over onto the new prototype
    for (var name in prop) {
      // Check if we're overwriting an existing function
      prototype[name] = typeof prop[name] == "function" && 
        typeof _super[name] == "function" && fnTest.test(prop[name]) ?
        (function(name, fn){
          return function() {
            var tmp = this._super;
            
            // Add a new ._super() method that is the same method
            // but on the super-class
            this._super = _super[name];
            
            // The method only need to be bound temporarily, so we
            // remove it when we're done executing
            var ret = fn.apply(this, arguments);        
            this._super = tmp;
            
            return ret;
          };
        })(name, prop[name]) :
        prop[name];
    }
    
    // The dummy class constructor
    function Class() {
      // All construction is actually done in the init method
      if ( !initializing && this.init )
        this.init.apply(this, arguments);
    }
    
    // Populate our constructed prototype object
    Class.prototype = prototype;
    
    // Enforce the constructor to be what we expect
    Class.prototype.constructor = Class;

    // And make this class extendable
    Class.extend = arguments.callee;
    
    return Class;
  };
})();

// -----
// SmartDisplay class
// -----

var SmartDisplay = Class.extend({
	init: function init() {
		this._handlers = {};
		this._updateInterval = null;
		
		this._progressIndicator = null;
		this._logo = null;
		
		this._smartDiv = null;
		
		this._socket = null;
		
		this._twitterTicker = null;
		
		this._animationEvent = this._animationEnded.bind(this);
	},
	
	run: function run() {
		this._smartDiv = $('SmartDisplay');
		this._sections = $('sections');
		
		this._logo = new ACMLogo();
		
		this._logoDiv = document.createElement('div');
		this._logoDiv.id = 'logo';
		this._logoDiv.appendChild(this._logo.element());
		this._smartDiv.appendChild(this._logoDiv);
		
		this._progressIndicator = new ProgressIndicator();
		this._smartDiv.appendChild(this._progressIndicator.element());
		
		this._socket = io.connect('http://localhost:3000/');
		this._socket.on('refresh', function() {
			location.reload();
		});
		
		this._twitterTicker = new TwitterTicker();
		this._smartDiv.appendChild(this._twitterTicker.element());
		
		for(var i in this._handlers) {
			var elm = this._handlers[i]._element();
			elm.id = i;
			elm.style.opacity = 0;
			elm.addEventListener('webkitTransitionEnd', this._animationEvent, false);
			
			this._sections.appendChild(elm);
		}
		
		var active = this._sections.children[0];
		var handler = this._handlers[active.id];
		
		handler.pageWillAppear(true);
		
		setTimeout(function() {
			active.classList.add('active');
			active.style.opacity = 1;
		}, 0);
		
		document.cookie = 'loaded=' + parseInt((new Date()).getTime() / 1000);
	},
	
	socket: function socket() {
		return this._socket;
	},
	
	registerHandler: function registerHandler(name, handler) {
		this._handlers[name] = new handler();
	},
	
	_animationEnded: function(e) {
		var section = e.srcElement;
		var value = section.style[e.propertyName];
		var handler = this._handlers[section.id];
		
		if(e.propertyName == 'opacity') {
			if(value == 1) {
				handler.pageDidAppear(true);
				
				this._progressIndicator.setProgress(0);
				
				var self = this;
				
				setTimeout(function() {
					self._timer();
				}, 150);
			} else if(value == 0) {
				handler.pageDidDisappear(true);
			}
		}
	},
	
	_timer: function() {
		var progress = this._progressIndicator.getProgress();
		
		if(progress == 1) {
			this._updateDisplay();
			
			return;
		}
		
		progress += 0.01;
		this._progressIndicator.setProgress(progress);
		
		var self = this;
		
		setTimeout(function() {
			self._timer();
		}, 150);
	},
	
	_updateDisplay: function() {
		var active = $$('active')[0];
		var next = active.nextElementSibling;
		
		if(next == null) {
			next = active.parentElement.children[0];
		}
		
		if(active.id in this._handlers) {
			var handler = this._handlers[active.id];
			
			if('pageWillDisappear' in handler) {
				handler.pageWillDisappear();
			}
		}
		
		if(next.id in this._handlers) {
			var handler = this._handlers[next.id];
			
			if('pageWillAppear' in handler) {
				handler.pageWillAppear();
			}
		}
		
		active.classList.remove('active');
		active.style.opacity = 0.0;
		next.style.opacity = 1.0;
		next.classList.add('active');
	}
});

SmartDisplay.sharedDisplay = (function() {
	var _SHARED_DISPLAY = null;
	
	return function() {
		if(_SHARED_DISPLAY == null) {
			_SHARED_DISPLAY = new SmartDisplay();
		}
		
		return _SHARED_DISPLAY;
	}
})();

// -----
// Transform class
// -----

var Transform = Class.extend({
	init: function init() {
		this.delegate = null;
		
		this._transforms = {
			rotate: 0,
			scale: {
				x: 0,
				y: 0
			},
			translate: {
				x: 0,
				y: 0
			}
		};
		
		this._units = {
			rotate: 'deg',
			scale: '',
			translate: 'px'
		}
		
		if(arguments.length > 0) {
			var string = arguments[0];
			
			this._transforms = this._parseString(string);
		}
	},
	
	_parseString: function _parseString(item) {
		var transforms = {
			rotate: 0,
			scale: {
				x: 0,
				y: 0
			},
			translate: {
				x: 0,
				y: 0
			}
		};
		
		var i = 0;
		
		while(i < item.length) {
			var temp = '';
			var transformType = '';
			
			for(; item[i] != '(' && i < item.length; i++) {
				transformType += item[i];
			}
			
			transformType = transformType.trim();
			
			if(!(transformType in transforms)) {
				return;
			}
			
			i++;
			
			for(var itemCount = 0, stop = false; i < item.length && !stop; i++) {
				if(item[i] == ',') {
					if(itemCount == 0) {
						// X
						transforms[transformType].x = parseInt(temp.trim());
					} else if(itemCount == 1) {
						// Y
						transforms[transformType].y = parseInt(temp.trim());
					}
					
					temp = '';
					
					itemCount++;
				} else if(item[i] == ')') {
					if(itemCount == 0) {
						// X
						if(transformType == 'rotate') {
							transforms[transformType] = parseInt(temp.trim());
						} else {
							transforms[transformType].x = parseInt(temp.trim());
							
							if(transformType == 'scale') {
								transforms[transformType].y = parseInt(temp.trim());
							}
						}
					} else if(itemCount == 1) {
						// Y
						transforms[transformType].y = parseInt(temp.trim());
					}
					
					temp = '';
					stop = true;
				} else {
					temp += item[i];
				}
			}
		}
		
		return transforms;
	},
	
	toString: function toString() {
		var string = [];
		
		for(var i in this._transforms) {
			if(typeof this._transforms[i] == 'object') {
				var parts = [i, '('];
				
				for(var j in this._transforms[i]) {
					parts.push(this._transforms[i][j]);
					parts.push(this._units[i]);
					parts.push(', ');
				}
				
				parts[parts.length - 1] = ')';
				
				string.push(parts.join(''));
			} else {
				string.push([i, '(', this._transforms[i], this._units[i], ')'].join(''));
			}
		}
		
		return string.join(' ');
	},
	
	scale: function scale(x, y) {
		if(y == undefined) {
			y = x;
		}
		
		this._transforms.scale.x += parseInt(x);
		this._transforms.scale.y += parseInt(y);
		
		if(this.delegate != null && 'transformDidChange' in this.delegate) {
			this.delegate.transformDidChange(this);
		}
	},
	
	rotate: function rotate(angle) {
		this._transforms.rotate += parseInt(angle);
		
		if(this.delegate != null && 'transformDidChange' in this.delegate) {
			this.delegate.transformDidChange(this);
		}
	},
	
	translate: function translate(x, y) {
		if(y == undefined) {
			y = 0;
		}
		
		this._transforms.translate.x += parseInt(x);
		this._transforms.translate.y += parseInt(y);
		
		if(this.delegate != null && 'transformDidChange' in this.delegate) {
			this.delegate.transformDidChange(this);
		}
	}
});

// -----
// ACMLogo class
// -----

var ACMLogo = Class.extend({
	init: function init() {
		this.transform = null;
		
		// Why do we set the styles here instead of in css? Because. Mostly so we get the right value when querying webkitTransform. Mostly also so that we abstract that away from the style.css file and for easy reuse elsewhere.
		
		var tmp1 = document.createElement('span');
		tmp1.style.position = 'relative';
		tmp1.style.top = '45px';
		tmp1.style.color = 'rgb(253, 254, 253)';
		tmp1.style.fontWeight = 'bold';
		tmp1.style.fontSize = '600%';
		tmp1.appendChild(document.createTextNode('acm'));
		
		var tmp2 = document.createElement('div');
		tmp2.style.background = '-webkit-gradient(linear, left bottom, left top, color-stop(1, rgb(8, 102, 172)), color-stop(0, rgb(141, 171, 218)))';
		tmp2.style.width = '220px';
		tmp2.style.height = '220px';
		tmp2.style.webkitBorderRadius = '110px';
		tmp2.style.position = 'relative';
		tmp2.style.top = '15px';
		tmp2.style.left = '15px';
		tmp2.style.textShadow = 'rgb(48, 111, 170) 5px 3px 0px';
		tmp2.appendChild(tmp1);
		
		tmp1 = document.createElement('div');
		tmp1.classList.add('inner');
		tmp1.style.webkitTransform = 'rotate(45deg)';
		tmp1.style.textAlign = 'center';
		tmp1.style.background = 'white';
		tmp1.style.width = '250px';
		tmp1.style.height = '250px';
		tmp1.style.webkitBorderRadius = '125px';
		tmp1.style.position = 'relative';
		tmp1.style.left = '25px';
		tmp1.style.top = '25px';
		tmp1.style.webkitBoxShadow = 'rgb(48, 111, 170) 7px 5px 0px';
		tmp1.appendChild(tmp2);
		
		this._root = document.createElement('div');
		this._root.classList.add('logo');
		this._root.style.background = '-webkit-gradient(linear, left bottom, right top, color-stop(0, rgb(8, 102, 172)), color-stop(1, rgb(141, 171, 218)))';
		this._root.style.webkitTransform = 'rotate(-45deg)';
		this._root.style.width = '300px';
		this._root.style.height = '300px';
		this._root.appendChild(tmp1);
		
		var self = this;
		
		this._root.addEventListener('DOMNodeInserted', function() {
			self._nodeInserted();
		}, false);
	},
	
	_nodeInserted: function _nodeInserted() {
		this._defaultTransform = new Transform(this._root.style.webkitTransform);
		this.transform = new Transform(this._root.style.webkitTransform);
		this.transform.delegate = this;
	},
	
	transformDidChange: function transformDidChange(transform) {
		this._root.style.webkitTransform = transform.toString();
	},
	
	resetTransform: function resetTransform() {
		this._root.style.webkitTransform = this._defaultTransform.toString();
	},
	
	element: function element() {
		return this._root;
	}
});

// -----
// ProgressIndicator class
// -----

var ProgressIndicator = Class.extend({
	init: function init() {
		// Default styles. These get overridden by the CSS properties defined for .progressIndicator.
		this._styles = {
			'background-color': 'rgb(180, 180, 180)',
			width: '40px',
			height: '40px'
		}
		
		this._canvas = document.createElement('canvas');
		this._canvas.classList.add('progressIndicator');
		
		this._ctx = this._canvas.getContext('2d');
		
		var self = this;
		
		this._canvas.addEventListener('DOMNodeInserted', function() {
			self._nodeInserted();
		}, false);
	},
	
	_nodeInserted: function _nodeInserted() {
		var style = $style(this._canvas);
		
		for(var i in this._styles) {
			var temp = style.getPropertyValue(i);
			
			if(temp != "" && temp != null && parseInt(temp) != 0 && temp != "transparent" && temp != "rgba(0, 0, 0, 0)") {
				this._styles[i] = temp;
			}
		}
		
		this._canvas.style.backgroundColor = 'transparent'; // Override so we don't actually see a background color.
		this._canvas.width = parseInt(this._styles.width);
		this._canvas.height = parseInt(this._styles.height);
		
		this.setProgress(0);
	},
	
	drawRect: function drawRect() {
		var rect = {origin: {x: 0, y: 0}, size: {width: this._canvas.width, height: this._canvas.height}};
		
		var ctx = this._ctx;
		
		ctx.fillStyle = this._styles['background-color'];
		ctx.strokeStyle = this._styles['background-color'];
		
		ctx.clearRect(rect.origin.x, rect.origin.y, rect.size.width, rect.size.height);
		
		var inset = rect.size.width / 10;
		
		var insetRect = {origin: {x: rect.origin.x + inset, y: rect.origin.y + inset}, size: {width: this._canvas.width - inset * 2, height: this._canvas.height - inset * 2}};
		
		ctx.lineWidth = inset - 1;
		
		ctx.beginPath();
		ctx.arc(insetRect.origin.x + insetRect.size.width / 2, insetRect.origin.y + insetRect.size.height / 2, insetRect.size.width / 2, 0, Math.PI * 2, true);
		ctx.closePath();
		ctx.stroke();
		
		var radius = insetRect.size.width / 2 - inset;
		
		ctx.beginPath();
		ctx.arc(insetRect.origin.x + insetRect.size.width / 2, insetRect.origin.y + insetRect.size.height / 2, radius, - Math.PI / 2, (Math.PI * this._progress * 2) - Math.PI / 2, false);
		ctx.lineTo(insetRect.origin.x + insetRect.size.width / 2, insetRect.origin.y + insetRect.size.height / 2);
		ctx.closePath();
		ctx.fill();
	},
	
	setProgress: function setProgress(val) {
		this._progress = Math.min(Math.max(val, 0), 1);
		
		this.drawRect();
	},
	
	getProgress: function getProgress() {
		return this._progress;
	},
	
	element: function element() {
		return this._canvas;
	}
});

// -----
// TwitterTicker Class
// -----

var TwitterTicker = Class.extend({
	init: function init() {
		this._tweets = [];
		this._currentIndex = -1;
		this._timer = null;
		this._currentTweet = null;
		this._callback = this._animationDone.bind(this);
		
		var self = this;
		var socket = SmartDisplay.sharedDisplay().socket();
		
		socket.on('tweet', function(data) {
			self._gotTweet(data.tweet);
			
			self._currentIndex++;
		});
		
		socket.on('tweets', function(data) {
			for(var i = 0; i < data.tweets.length; i++) {
				self._gotTweet(data.tweets[i]);
			}
			
			// Got a bunch of tweets? Reset the current tweet, and force an update...
			self._currentIndex = -1;
			clearTimeout(self._timer);
			
			self._updateDisplay();
		});
		
		socket.emit('tweets');
		
		this._container = document.createElement('div');
		this._container.classList.add('twitterTickerContainer');
		
		this._element = document.createElement('div');
		this._element.classList.add('twitterTicker');
		this._container.appendChild(this._element);
	},
	
	_animationDone: function _animationDone(e) {
		if(e.propertyName == "left") {
			this._currentTweet.removeEventListener('webkitTransitionEnd', this._callback, false);
			
			var self = this;
			
			setTimeout(function() {
				self._updateDisplay();
			}, 3500);
		} else if(this._currentTweet != e.target && e.propertyName == "top") {
			if(this._currentTweet != null) {
				this._element.removeChild(this._currentTweet);
			}
			
			this._currentTweet = e.target;
			
			var tweetWidth = parseInt($style(this._currentTweet).width);
			var tickerWidth = parseInt($style(this._element).width);
			
			if(tweetWidth > tickerWidth) {
				var duration = (tweetWidth - tickerWidth) / 125.0;
				
				var transitionDuration = $style(this._currentTweet).webkitTransitionDuration.split(',');
				transitionDuration[transitionDuration.length - 1] = duration + 's';
				this._currentTweet.style.webkitTransitionDuration = transitionDuration.join(',');
				
				var tickerPadding = parseInt($style(this._currentTweet).paddingLeft);
				var containerPadding = parseInt($style(this._container).paddingLeft);
				
				var self = this;
				
				setTimeout(function() {
					self._currentTweet.style.left = "-" + (tweetWidth - tickerWidth + tickerPadding * 2 + containerPadding) + "px";
				}, 3500);
			} else {
				this._currentTweet.removeEventListener('webkitTransitionEnd', this._callback, false);
				
				var self = this;
				
				setTimeout(function() {
					self._updateDisplay();
				}, 7000);
			}
		}
	},
	
	_updateDisplay: function _updateDisplay() {
		if(++this._currentIndex >= this._tweets.length) {
			this._currentIndex = 0;
		}
		
		var self = this;
		
		var tweet = this._tweets[this._currentIndex];
		var tickerHeight = $style(this._element).height;
		
		var p = document.createElement('p');
		
		var strong = document.createElement('strong');
		strong.appendChild(document.createTextNode(tweet.text));
		p.appendChild(strong);
		
		var em = document.createElement('em');
		var tweetDate = new Date(tweet.created_at);
		em.appendChild(document.createTextNode(" - " + tweetDate.toRelativeString()));
		p.appendChild(em);
		
		p.style.top = tickerHeight;
		this._element.appendChild(p);
		
		p.addEventListener('webkitTransitionEnd', this._callback, false);
		
		// We set timeout so that our animations are actually applied and our callback is fired.
		setTimeout(function() {
			p.style.top = "0px";
		
			if(self._currentTweet != null) {
				self._currentTweet.style.top = "-" + tickerHeight;
			}
		}, 0);
	},
	
	_gotTweet: function _gotTweet(tweet) {
		this._tweets.push(tweet);
		this._tweets = this._tweets.sort(function(a, b) {
			return (Date.parse(b.created_at)) - (Date.parse(a.created_at));
		});
		this._tweets.splice(5);
	},
	
	element: function element() {
		return this._container;
	}
});

// -----
// Page class
// -----

var Page = Class.extend({
	init: function init() {
		this.view = null;
	},
	
	_element: function _element() {
		if(this.view == null) {
			this.loadView();
			
			if(this.view == null) {
				throw new Error("this.view must be set in loadView.");
			}
		}
		
		return this.view;
	},
	
	loadView: function loadView() {
		this.view = document.createElement('section');
	},
	
	pageWillAppear: function pageWillAppear(animated) {
		
	},
	
	pageDidAppear: function pageDidAppear(animated) {
		
	},
	
	pageWillDisappear: function pageWillDisappear(animated) {
		
	},
	
	pageDidDisappear: function pageDidDisappear(animated) {
		
	}
});