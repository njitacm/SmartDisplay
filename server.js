var express = require('express'),
	sio = require('socket.io'),
	TwitterStream = require('./TwitterStream').TwitterStream;

var app = express.createServer(),
	io = sio.listen(app),
	ts = new TwitterStream();

app.configure(function() {
	app.use(express.static(__dirname + '/public'));
});

ts.userID = '81022776';
ts.use(io.sockets);
ts.connect();

app.listen(3000);