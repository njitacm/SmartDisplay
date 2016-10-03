var Home = Page.extend({
	_days: null,
	_hours: null,
	_minutes: null,
	_seconds: null,
	
	_countdownHeading: null,
	_nowHeading: null,
	
	_nextMeeting: null,
	
	_running: false,
	
	init: function() {
		this._super();
		
		this._calculateNextMeeting();
	},
	
	_calculateNextMeeting: function() {
		if(false) {
			// This is for the summer.
			
			this._nextMeeting = -1;
			
			return;
		}
		
		var d = new Date();
		var delta = 0;
		
		function adjustForMeetingNextWeek(date) {
			return 12 - date.getDay(); // 12 = 5(Wednesday) + 7
		}
		
		function adjustForMeetingThisWeek(date) {
			return 5 - date.getDay()
		}
		
		if(d.getDay() > 5) {
			delta = adjustForMeetingNextWeek(d);
		} else if(d.getDay() == 5) {
			if(d.getHours() > 12) {
				delta = adjustForMeetingNextWeek(d);
			} else if(d.getHours() == 12) {
				if(d.getMinutes() >= 29) {
					delta = adjustForMeetingNextWeek(d);
				} else {
					delta = adjustForMeetingThisWeek(d);
				}
			} else {
				delta = adjustForMeetingThisWeek(d);
			}
		} else {
			delta = adjustForMeetingThisWeek(d);
		}
		
		d.setDate(d.getDate() + delta);
		d.setHours(12);
		d.setMinutes(0);
		d.setSeconds(0);
		
		this._nextMeeting = d;
	},
	
	loadView: function loadView() {
		this._super();
		
		var heading = document.createElement('h1');
		heading.appendChild(document.createTextNode('Association for Computing Machinery'));
		heading.style.margin = '0 auto';
		this.view.appendChild(heading);
		
		heading = document.createElement('h2');
		heading.appendChild(document.createTextNode('Meetings - Fridays, 12 Noon, GITC 1400'));
		heading.style.marginTop = '3em';
		this.view.appendChild(heading);
		
		heading = document.createElement('h2');
		heading.appendChild(document.createTextNode('Time until next meeting:'));
		heading.style.marginTop = '3em';
		this.view.appendChild(heading);
		
		this._days = document.createElement('span');
		this._hours = document.createElement('span');
		this._minutes = document.createElement('span');
		this._seconds = document.createElement('span');
		
		var em;
		
		heading = document.createElement('h2');
		heading.appendChild(this._days);
		
		em = document.createElement('em');
		em.innerText = ' days ';
		heading.appendChild(em);
		
		heading.appendChild(this._hours);
		
		em = document.createElement('em');
		em.innerText = ' hrs ';
		heading.appendChild(em);
		
		heading.appendChild(this._minutes);
		
		em = document.createElement('em');
		em.innerText = ' mins ';
		heading.appendChild(em);
		
		heading.appendChild(this._seconds);
		
		em = document.createElement('em');
		em.innerText = ' secs ';
		heading.appendChild(em);
		
		this._countdownHeading = heading;
		
		this.view.appendChild(this._countdownHeading);
		
		heading = document.createElement('h2');
		heading.innerText = 'NOW!';
		heading.style.display = 'none';
		
		this._nowHeading = heading;
		
		this.view.appendChild(this._nowHeading);
	},
	
	pageWillAppear: function(animated) {
		this._running = true;
		
		this._updateDisplay();
	},
	
	pageDidDisappear: function(animated) {
		this._running = false;
	},
	
	_updateDisplay: function _updateDisplay() {
		if(this._nextMeeting == -1) {
			this._nowHeading.innerText = "Next Fall";
			
			this._nowHeading.style.display = 'block';
			this._countdownHeading.style.display = 'none';
			
			return;
		}
		
		var d = new Date();
		var delta = (this._nextMeeting - d) / 1000;
		
		if(delta <= 0) {
			if(delta < - 60 * 30) {
				this._calculateNextMeeting();
				delta = (this._nextMeeting - d) / 1000;
				
				this._nowHeading.style.display = 'none';
				this._countdownHeading.style.display = 'block';
			} else if(this._nowHeading.style.display != 'block') {
				this._nowHeading.style.display = 'block';
				this._countdownHeading.style.display = 'none';
			}
		}
		
		this._days.innerText = Math.floor(delta / (60 * 60 * 24));
		this._hours.innerText = Math.floor(delta % (60 * 60 * 24) / (60 * 60));
		this._minutes.innerText = Math.floor(delta % (60 * 60 * 24) % (60 * 60) / 60);
		this._seconds.innerText = Math.floor(delta % (60 * 60 * 24) % (60 * 60) % 60);
		
		if(this._running) {
			var self = this;
			
			setTimeout(function() {
				self._updateDisplay();
			}, 500);
		}
	}
});

SmartDisplay.sharedDisplay().registerHandler('Home', Home);
