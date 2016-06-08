var pg = require('pg');
var fs = require('fs');
var cool = require('cool-ascii-faces');
var express = require('express');
var app = express();

//set up support for handling post requests
var bodyParser = require('body-parser');
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
}));
var multer = require('multer');
var upload = multer({dest:'uploads/'});

//set the port
app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(request, response) {
	response.render('pages/admin');
});

app.get('/create', function(request, response) {
	response.render('pages/create');
});

app.post('/create', upload.single('select_file'), function(request, response, next) {
    var test_name = request.body.title;
    var test_description = request.body.description;
    console.log(request.file);
    response.send(test_name);
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

//var webdriver = require('selenium-webdriver'),
 //   By = webdriver.By,
  //  until = webdriver.until;

//System.setProperty("webdriver.chrome.driver","./chromedriver");

//var driver = new ChromeDriver();
//
//var driver = new webdriver.Builder()
  //  .forBrowser('chrome')
    //.build();

//driver.get('localhost:5000');
//driver.findElement(By.name('q')).sendKeys('webdriver');
//driver.findElement(By.name('btnG')).click();
//driver.wait(until.titleIs('webdriver - Google Search'), 1000);
//driver.quit();
