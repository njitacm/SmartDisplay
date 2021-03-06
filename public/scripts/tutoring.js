var Tutoring = (function() {
	function Time(hours, minutes, seconds) {
		var tmpDate = new Date();

		this.hours = (hours === undefined) ? tmpDate.getHours() : hours;
		this.minutes = (minutes === undefined) ? tmpDate.getMinutes() : minutes;
		this.seconds = (seconds === undefined) ? tmpDate.getSeconds() : seconds;
	}

	Time.prototype.toString = function() {
		var suffix = 'AM';
		var hours = this.hours;

		if(hours > 12) {
			suffix = 'PM';
			hours -= 12;
		} else if(hours == 0) {
			hours = 12;
		} else if(hours == 12) {
			suffix = 'PM';
		}

		var minutes = this.minutes;

		if(minutes < 10) {
			minutes = '0' + minutes;
		}

		return [hours, ':', minutes, ' ', suffix].join('');
	}

	Time.prototype.toDate = function() {
		return new Date(0, 0, 0, this.hours, this.minutes, this.seconds, 0);
	}

	function MeetingTime(day, start, end) {
		this.day = day;
		this.startTime = start;
		this.endTime = end;
	}

	MeetingTime.prototype.containsDate = function(d) {
		var endDate = this.endTime.toDate();
		var startDate = this.startTime.toDate()
		var currentDate = (new Time(d.getHours(), d.getMinutes(), d.getSeconds())).toDate()

		var range = endDate - startDate;
		var delta = endDate - currentDate;

		return (endDate >= currentDate && startDate <= currentDate);
	}

	MeetingTime.prototype.toActualString = function() {
		return [this.startTime.toString(), ' - ', this.endTime.toString()].join('');
	}

	MeetingTime.prototype.toString = function() {
		var d = new Date();

		var dayOfTheWeek = d.getUTCDay(); // 0 = Sunday for UTC, but 0 = Monday for us. So we subtract 1.
		var delta = (this.day + 1) - dayOfTheWeek;

		d.setDate(d.getDate() + delta);
		d.setHours(this.startTime.hours);
		d.setMinutes(this.startTime.minutes);
		d.setSeconds(this.startTime.seconds);

		return d.toString();
	}

	MeetingTime.dayToString = function(a) {
		var b = '';

		switch(a) {
			case MeetingTime.Days.MONDAY:
				b = 'Monday';
				break;
			case MeetingTime.Days.TUESDAY:
				b = 'Tuesday';
				break;
			case MeetingTime.Days.WEDNESDAY:
				b = 'Wednesday';
				break;
			case MeetingTime.Days.THURSDAY:
				b = 'Thursday';
				break;
			case MeetingTime.Days.FRIDAY:
				b = 'Friday';
				break;
		}

		return b;
	}

	MeetingTime.Days = {};
	MeetingTime.Days.MONDAY = 0;
	MeetingTime.Days.TUESDAY = 1;
	MeetingTime.Days.WEDNESDAY = 2;
	MeetingTime.Days.THURSDAY = 3;
	MeetingTime.Days.FRIDAY = 4;
	MeetingTime.Days.COUNT = 5;

	var Tutoring = Page.extend({
		_today: null,

		_data: [
			{
			  name: 'Max Alekhnovich',
			  subjects: ['JavaScript'],
			  courses: ['IS 218', '219', '322', '331', '333', '344', '373', '390', 'IT 310'],
			  times: [new MeetingTime(MeetingTime.Days.MONDAY, new Time(14, 00, 00), new Time(15, 30, 00))]
			},
			{
			  name: 'David Barnes',
			  subjects: ['Java','Python'],
			  courses: ['CS 100', '113'],
			  times: [new MeetingTime(MeetingTime.Days.THURSDAY, new Time(13, 00, 00), new Time(14, 30, 00))]
			},
			{
			  name: 'Matthew Belanger',
			  subjects: ['C++', 'Java','Python'],
			  courses: ['CS 100', '113'],
			  times: [new MeetingTime(MeetingTime.Days.TUESDAY, new Time(11, 30, 00), new Time(13, 00, 00))]
			},
			{
			  name: 'Alec Brion',
			  subjects: ['Java','Python'],
			  courses: ['CS 100', '113', '114', '241', '252', '280', '288', '332', '337', '345', '356', '388', '431', '435'],
			  times: [new MeetingTime(MeetingTime.Days.WEDNESDAY, new Time(14, 30, 00), new Time(17, 30, 00))]
			},
			{
			  name: 'Sidney Carr',
			  subjects: ['MATLAB'],
			  courses: ['CS 100', '113', '114', '241', '252', '280', '288', '332'],
			  times: [new MeetingTime(MeetingTime.Days.WEDNESDAY, new Time(14, 30, 00), new Time(16, 00, 00))]
			},
			{
			  name: 'John Daudelin',
			  subjects: ['Java','Python'],
			  courses: ['CS 100', '113'],
			  times: [new MeetingTime(MeetingTime.Days.THURSDAY, new Time(13, 30, 00), new Time(15, 00, 00))]
			},
			{
			  name: 'David Etler',
			  subjects: ['Java','Python'],
			  courses: ['CS 113', '114', '115', '116', '252', '280'],
			  times: [new MeetingTime(MeetingTime.Days.THURSDAY, new Time(15, 00, 00), new Time(17, 00, 00))]
			},
			{
			  name: 'Atsuki Imamura',
			  subjects: ['MATLAB'],
			  courses: ['CS 100', '113', '114', '241', '252', '280', '288', '332'],
			  times: [new MeetingTime(MeetingTime.Days.MONDAY, new Time(16, 00, 00), new Time(17, 30, 00))]
			},
			{
			  name: 'Pious Kukreja',
			  subjects: ['Java','Python'],
			  courses: ['CS 100', '113', '114', '252', '332', '356', '431'],
			  times: [new MeetingTime(MeetingTime.Days.WEDNESDAY, new Time(11, 30, 00), new Time(14, 30, 00)), new MeetingTime(MeetingTime.Days.THURSDAY, new Time(11, 30, 00), new Time(14, 30, 00))]
			},
			{
			  name: 'Justin Mangaoang',
			  subjects: ['Java','Python'],
			  courses: ['CS 100', '113', '114', '241', '252', '280', '288', '332', '341', '356', '388', '431', '435'],
			  times: [new MeetingTime(MeetingTime.Days.TUESDAY, new Time(14, 00, 00), new Time(17, 00, 00)), new MeetingTime(MeetingTime.Days.WEDNESDAY, new Time(16, 00, 00), new Time(18, 00, 00))]
			},
			{
			  name: 'Mohit Nakrani',
			  subjects: ['Java','Python'],
			  courses: ['CS 100', '113', '114', '241', '252', '280', '288', '332', '356', '431'],
			  times: [new MeetingTime(MeetingTime.Days.MONDAY, new Time(16, 00, 00), new Time(18, 00, 00))]
			},
			{
			  name: 'Karina Palaric',
			  subjects: ['Java','Python'],
			  courses: ['CS 100', '114', '115', '252', '280', '431'],
			  times: [new MeetingTime(MeetingTime.Days.TUESDAY, new Time(16, 30, 00), new Time(18, 00, 00)), new MeetingTime(MeetingTime.Days.FRIDAY, new Time(16, 30, 00), new Time(18, 00, 00))]
			},{
			  name: 'Wyatt Peters',
			  subjects: ['Java','Python'],
			  courses: ['CS 100', 'IS 117', '218', '247'],
			  times: [new MeetingTime(MeetingTime.Days.FRIDAY, new Time(13, 00, 00), new Time(16, 00, 00))]
			},{
			  name: 'Alex Rodrigues',
			  subjects: ['Java','Python'],
			  courses: ['CS 100', '113', '114', '115', '252', '280', '332'],
			  times: [new MeetingTime(MeetingTime.Days.FRIDAY, new Time(10, 00, 00), new Time(11, 30, 00))]
			},
			{
			  name: 'Shikha Shah',
			  subjects: ['Java','Python'],
			  courses: ['CS 100', '113', '114', '252', '280'],
			  times: [new MeetingTime(MeetingTime.Days.MONDAY, new Time(14, 30, 00), new Time(16, 00, 00)), new MeetingTime(MeetingTime.Days.TUESDAY, new Time(14, 30, 00), new Time(16, 00, 00))]
			},
			{
			  name: 'Dushyant Singh',
			  subjects: ['Java','Python'],
			  courses: ['CS 100', '113'],
			  times: [new MeetingTime(MeetingTime.Days.MONDAY, new Time(12, 30, 00), new Time(14, 00, 00)), new MeetingTime(MeetingTime.Days.FRIDAY, new Time(13, 00, 00), new Time(14, 30, 00))]
			}
		],

		init: function() {
			this._date = new Date();
			this._date.setDate(this._date.getDate() - 1);
		},

		loadView: function() {
			this._super();

			this._createTable();
			this._fillTableWith(this._data);
		},

		pageWillAppear: function(animated) {
			this._super(animated);

			SmartDisplay.sharedDisplay()._logoDiv.style.webkitTransform = 'translate(125px, -106px) scale(0.2)';

			this._updateHighlighted();
		},

		pageWillDisappear: function(animated) {
			this._super(animated);

			SmartDisplay.sharedDisplay()._logoDiv.style.webkitTransform = '';
		},

		_updateHighlighted: function() {
			var d = new Date();

			var dayOfTheWeek = d.getDay();

			if(d.getDate() != this._date.getDate()) {
				var oldItems = $$('tdHighlighted');

				for(var i = 0; i < oldItems.length; i++) {
					oldItems[i].classList.remove('tdHighlighted');

					i--;
				};

				var tbody = this.table.getElementsByTagName('tbody')[0];
				var rows = tbody.getElementsByTagName('tr');

				for(var i = 0; i < rows.length; i++) {
					var elm = rows[i].children[dayOfTheWeek];

					if(elm == null) {
						continue;
					}

					elm.classList.add('tdHighlighted');
				};
			}

			for(var i = 0; i < this._data.length; i++) {
				var data = this._data[i];
				var row = data.row;

				for(var j = 0; j < data.times.length; j++) {
					var time = data.times[j];

					if(time.day == dayOfTheWeek - 1) {
						if(!row.classList.contains('trHighlighted') && time.containsDate(d)) {
							row.classList.add('trHighlighted');
						} else if(row.classList.contains('trHighlighted') && !time.containsDate(d)) {
							row.classList.remove('trHighlighted');
						}
					}
				}
			}

			this._date = d;

		},

		_createTable: function() {
			this.table = document.createElement('table');
			this.table.classList.add('tutoring');
			this.table.cellSpacing = '0';

			var heading = document.createElement('h2');
			heading.appendChild(document.createTextNode('Spring 2016 - ACM Tutoring Schedule'));
			this.view.appendChild(heading);

			var row = document.createElement('tr');

			var item = document.createElement('th'); // This is a blank column. Doesn't really do anything...
			item.width = '40%';
			row.appendChild(item);

			for(var i = 0; i < MeetingTime.Days.COUNT; i++) {
				item = document.createElement('th');
				item.width = '12%';
				item.appendChild(document.createTextNode(MeetingTime.dayToString(i)));
				row.appendChild(item);
			}

			this.table.appendChild(row);

			this.tbody = document.createElement('tbody');
			this.table.appendChild(this.tbody);

			this.view.appendChild(this.table);
		},

		_fillTableWith: function(data) {
			for(var i = 0; i < data.length; i++) {
				var dataRow = data[i];

				dataRow.times = dataRow.times.sort(function(a, b) {
					if(a.day < b.day) {
						return -1;
					} else if(a.day > b.day) {
						return 1;
					} else {
						return a.startTime.toDate() - b.startTime.toDate();
					}
				});

				var row = document.createElement('tr');

				data[i].row = row;

				if(i % 2 == 0) {
					row.classList.add('alt');
				}

				var item = document.createElement('td');

				var heading = document.createElement('h4');
				heading.appendChild(document.createTextNode(dataRow.name));
				item.appendChild(heading);

				var p = document.createElement('p');
				p.appendChild(document.createTextNode('Subjects: ' + dataRow.subjects.join(', ')));
				item.appendChild(p);

				p = document.createElement('p');
				p.appendChild(document.createTextNode('Courses: ' + dataRow.courses.join(', ')));
				item.appendChild(p);

				row.appendChild(item);

				var k = 0;
				for(var j = 0; j < MeetingTime.Days.COUNT; j++) {
					item = document.createElement('td');

					var meetingTime = dataRow.times[k];

					if(meetingTime && meetingTime.day == j) {
						item.appendChild(document.createTextNode(dataRow.times[k].toActualString()));

						k++;
					}

					row.appendChild(item);
				}
				k = 0;

				this.tbody.appendChild(row);
			}
		}
	});

	SmartDisplay.sharedDisplay().registerHandler('Tutoring', Tutoring);
})();
