var fs = require('fs');
var pg = require('pg');
var express = require('express');
var app = express();

//for unique url extensions
var crypto = require('crypto');

//for reporting success and failure
var success = null;
var success_title = null;
var schedule_url = null;
var error_message = null;

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

//set where files are
app.use(express.static(__dirname + '/public'));

//views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

//default page set to redirect to admin
app.get('/', function(request, response) {
	response.redirect('/admin');
});

//create page get method
app.get('/create', function(request, response) {
	response.render('pages/create');
});

//create page post method
app.post('/create', upload.single('select_file'), function(request, response, next) {
    var test_name = request.body.title;
    var test_description = request.body.description;
    //needed for bytea
    var test_data = '\\x';
    //time to read the file
    fs.readFile(request.file.path, 'hex', function (err,data) {
        if (err) {
            return console.error(err);
        }
        //grab the data
        test_data = test_data + data;
        //query the database to insert the new test 
        pg.connect(process.env.DATABASE_URL, function(err, client, done) {
			if (err) {
				return console.error(err);
			}
            client.query('insert into tests (title, description, instructions) values ($1, $2, $3)',
				[test_name, test_description, test_data],
				function(err, result) {
					done();
					if (err) {
						console.error(err);
						error_message = err;
						success = false;
						success_title = test_name;
						response.redirect('/admin');
					}
					else { 
						//first unlink/remove the file we added to uploads/
						fs.unlink(request.file.path);
						//then redirect back to the admin page
						success = true;
						success_title = test_name;
						response.redirect('/admin');
					}
			});
        });
    });
});

//test page get method
app.get('/test', function(request, response) {
	response.render('pages/test', {deadline: '31/12/2016'} );
});

//test page post method
//TODO

//admin page get method
app.get('/admin', function(request, response) {

    //Create variables to hold the values from the tables
    var test_array = [];
    var test_instances_array = [];

    //add a flag to check if the first query finished
    //since this is viewed in two queries, there is a chance of having a race condition
    //the race condition should result in the page never loading
    var first_query_complete = false;
	
	//call to render admin when called below
	var renderPage = function() {
		var current_success = success;
		success = null;
		
		var current_success_title = success_title;
		success_title = null;
		
		var current_schedule_url = schedule_url;
		schedule_url = null;
		
		var current_error_message = error_message;
		error_message = null;
		
		response.render('pages/admin', {test_array: test_array, test_instances_array: test_instances_array, success: current_success, success_title: current_success_title, schedule_url: current_schedule_url, error_message: current_error_message});
	}
    
    //Query the tables so we can show admins the data
    pg.connect(process.env.DATABASE_URL, function(err, client, done) {
		if (err) {
			return console.error(err);
		}
		//Query tests table for everything but the file
		client.query('SELECT title, description FROM tests', function(err, result) {
			done();
			if (err) {
				console.error(err); response.send("Error " + err);
			}
			else { 
				test_array = result.rows; 
				if(first_query_complete) {
					//render the page while passing the data
					renderPage();
				}
				else {
					first_query_complete = true;
				}
			}
		});
		//Query the test_instances table for everything but the file
		client.query('SELECT name, email, test_title, start_time, end_time, url FROM test_instances', function(err, result) {
			done();
			if (err) {
				console.error(err); response.send("Error " + err); 
			}
			else { 
				test_instances_array = result.rows; 
				//console.log(result.rows[3].start_time);
				
				if(first_query_complete) {
					//render the page while passing the data
					renderPage();
				}
				else {
					first_query_complete = true;
				}
			}
		});
    });
});

//schedule page get method
app.get('/schedule', function(request, response) {
	response.render('pages/schedule', {test_title: request.query.testname});
});

//schedule page post method
app.post('/schedule', function(request, response, next) {
    var candidate_name = request.body.candidatename;
    var candidate_email = request.body.candidateemail;
    var start_time = request.body.starttime;
    var end_time = request.body.endtime;
    var test_name = request.body.testtitle;
    
    //Using crypto for the url should always result in a unique base64 string
	//190 bytes results in 256 char string
    var test_url = crypto.pseudoRandomBytes(190).toString('base64')
		.replace(/\//g,'_').replace(/\+/g,'-');
    
    pg.connect(process.env.DATABASE_URL, function(err, client, done) {
		if (err) {
			return console.error(err);
		}
        client.query('insert into test_instances (name, email, test_title, start_time, end_time, url) values ($1, $2, $3, $4, $5, $6)',
			[candidate_name, candidate_email, test_name, start_time, end_time, test_url],
			function(err, result) {
				done();
				if (err) {
					console.error(err);
					error_message = err;
					success = false;
					success_title = test_name;
					response.redirect('/admin');
				}
				else { 
					//first unlink/remove the file we added to uploads/
					// fs.unlink(request.file.path); //TODO: is this needed, caused an error
					
					//then redirect back to the admin page
					success = true;
					success_title = test_name;
					schedule_url = 'http://www.' + request.headers.host + '/test/' + test_url;
					response.redirect('/admin');
				}
		});
    });
});

/*** Test pages
//test using node modules
var cool = require('cool-ascii-faces');
app.get('/cool', function(request, response) {
	response.send(cool());
});

//test environment vars
app.get('/times', function(request, response) {
	var result = ''
	var times = process.env.TIMES || 5
	for (i=0; i < times; i++)
		result += i + ' ';
	response.send(result);
});

//test connecting to database
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
***/

//redirects bad url extensions to default page
app.get('/*', function (request, response) {
	response.redirect('/');
});

//log when app has started
app.listen(app.get('port'), function() {
	console.log('Node app is running on port', app.get('port'));
});

//Selenium function testing
// var selenium = require('selenium-webdriver');
//    By = selenium.By,
//   until = selenium.until;
// var chai = require('chai');
// chai.use = require('chai-as-promised');
// var expect = chai.expect;

// //System.setProperty("webdriver.chrome.driver","./chromedriver");

// //var driver = new ChromeDriver();
// //
// var driver = new selenium.Builder()
//   .forBrowser('chrome')
// .build();

// driver.get('localhost:5000');

//     // expect(driver.getTitle()).to.eventually.contain
//     //     'Dreamjoob Deliverer'
// //driver.findElement(By.name('q')).sendKeys('webdriver');
// //driver.click("create-new-test");
// driver.findElement(By.id('create-new-test')).click();
// driver.findElement(By.id('cancel')).click();
// //driver.wait(until.titleIs('webdriver - Google Search'), 1000);
// //driver.quit();
