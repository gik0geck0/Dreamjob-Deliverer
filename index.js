var pg = require('pg');
var cool = require('cool-ascii-faces');
var express = require('express');
var app = express();

var test = express();

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(request, response) {
	response.render('pages/test', {deadline: '31/12/2016'} );
});

app.get('/create', function(request, response) {
	response.render('pages/create');
});

app.get('/test', function(request, response) {
	response.render('pages/test', {deadline: '31/12/2016'} );
});

app.get('/admin', function(request, response) {
	response.render('pages/admin');
});
    
app.get('/schedule', function(request, response) {
	response.render('pages/schedule');
});

app.get('/cool', function(request, response) {
	response.send(cool());
});

app.get('/times', function(request, response) {
	var result = ''
	var times = process.env.TIMES || 5
	for (i=0; i < times; i++)
		result += i + ' ';
	response.send(result);
});

app.get('/db', function (request, response) {
	pg.connect(process.env.DATABASE_URL, function(err, client, done) {
	client.query('SELECT * FROM test_table', function(err, result) {
		done();
		if (err)
			{ console.error(err); response.send("Error " + err); }
		else
			{ response.render('pages/db', {results: result.rows} ); }
		});
	});
});


app.get('/*', function (request, response) {
	response.redirect('/');
});

app.listen(app.get('port'), function() {
	console.log('Node app is running on port', app.get('port'));
});
