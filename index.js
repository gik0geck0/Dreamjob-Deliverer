var fs = require('fs');
var pg = require('pg');
var express = require('express');
var app = express();

//TODO: use this to create unique URL extensions for scheduled tests
var crypto = require('crypto');

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

//views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(request, response) {
	response.redirect('/admin');
});

app.get('/create', function(request, response) {
	response.render('pages/create');
});

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
						response.send("Error " + err);
					}
					else { 
						//first unlink/remove the file we added to uploads/
						fs.unlink(request.file.path);
						//then redirect back to the admin page
						response.redirect('/admin');
					}
			});
        });
    });
});

app.get('/test', function(request, response) {
	response.render('pages/test', {deadline: '31/12/2016'} );
});

app.get('/admin', function(request, response) {

    //Create variables to hold the values from the tables
    var test_array = [];
    var test_instances_array = [];

    //add a flag to check if the first query finished
    //since this is viewed in two queries, there is a chance of having a race condition
    //The race condition should result in the page never loading
    var first_query_complete = false;
    
    //Query the tables so we can show admins the data

    pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    if (err) {
        return console.error(err);
    }
    //Query tests table for everything but the file
	client.query('SELECT title, description FROM tests', function(err, result) {
		done();
		if (err)
			{ console.error(err); response.send("Error " + err); }
		else
			{ 
                test_array = result.rows; 
                if(first_query_complete)
                {
                    //render the page while passing the data
                    response.render('pages/admin', {test_array: test_array, test_instances_array: test_instances_array});
                }
                else
                {
                    first_query_complete = true;
                }
            }
		});
    //Query the test_instances table for everything but the file
    client.query('SELECT name, email, test_title, start_time, end_time, url FROM test_instances', function(err, result) {
		done();
		if (err)
			{ console.error(err); response.send("Error " + err); }
		else
			{ 
                test_instances_array = result.rows; 
                //console.log(result.rows[3].start_time);
                
                
                if(first_query_complete)
                {
                    //render the page while passing the data
                    response.render('pages/admin', {test_array: test_array, test_instances_array: test_instances_array});
                }
                else
                {
                    first_query_complete = true;
                }
            }
		});
    });
});
    
app.get('/schedule', function(request, response) {
	response.render('pages/schedule', {test_title: request.query.testname});
});

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
					response.send("Error " + err);
				}
				else { 
					//first unlink/remove the file we added to uploads/
					fs.unlink(request.file.path);
					//then redirect back to the admin page
					response.redirect('/admin');
				}
		});
    });
});

/*** Test pages
var cool = require('cool-ascii-faces');
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
***/

app.get('/*', function (request, response) {
	response.redirect('/');
});

app.listen(app.get('port'), function() {
	//console.log('Node app is running on port', app.get('port'));
});

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
