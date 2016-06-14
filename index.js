var express = require('express');
var app = express();
var subapp = express();
var test = express();
var admin = express();

//for file stuff
var fs = require('fs');

//for postgresql
var pg = require('pg');

//for unique url extensions
var crypto = require('crypto');

//for reporting success and failure
var success = null;
var success_title = null;
var success_url = null;
var success_filename = null;
var error_message = null;

//set up support for handling post requests
var bodyParser = require('body-parser');
app.use(bodyParser.json());		// to support JSON-encoded bodies
app.use(bodyParser.urlencoded({	// to support URL-encoded bodies
    extended: true
}));
var multer = require('multer');
var upload = multer({dest:'uploads/'});

//set the port
app.set('port', (process.env.PORT || 5000));

//URL paths for links
var testURL = '/app/test/';
var adminURL = '/app/admin/'
var createURL = '/app/admin/create/';
var scheduleURL = '/app/admin/schedule/';
var rescheduleURL = '/app/admin/reschedule/';
var viewURL = '/app/admin/view/';
var downloadURL = '/app/admin/download/';

//set where files are
app.use(express.static(__dirname + '/public'));

//mount the sub apps
app.use('/app', subapp);
subapp.use('/test', test);
subapp.use('/admin', admin);

//views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

//default page set to redirect to admin
app.get('/', function(request, response) {
	response.redirect(adminURL);
});

//test page index
test.get('/', function(request, response) {
	response.render('pages/index');
});

//test page for tests get request
test.get('/*', function(request, response) {
	//test_url is everything after last /
	var test_url = request.url.substring(1);
	
	var current_success = success;
	success = null;
	
	var current_success_filename = success_filename;
	success_filename = null;
	
	var current_error_message = error_message;
	error_message = null;
	
	pg.connect(process.env.DATABASE_URL, function(err, client, done) {
		if (err) {
			return console.error(err);
		}
		//Query tests table for everything but the file
		client.query('SELECT test_title, start_time, end_time, instructions FROM tests, test_instances WHERE test_title = title AND url = $1', [test_url], function(err, result) {
			done();
			if (err) {
				console.error(err);
				response.send("Error " + err);
			}
			else {
				var inst = result.rows;
				if (inst.length < 1 || new Date(inst[0].start_time) > new Date() || new Date(inst[0].end_time) < new Date()) {
					response.redirect(testURL);
				}
				else {
                    //to pass pdf information and use it in JavaScript we must first convert it to a string
                    var instr_str = inst[0].instructions.toString("base64");
					response.render('pages/test', {test_instance: inst[0], instr_data: instr_str, success: current_success, success_filename: current_success_filename, error_message, current_error_message});
				}
			}
		});
	});
});

//test page post method
test.post('/*', upload.single('select_file'), function(request, response, next) {
    var test_data = '\\x';
	var test_url = request.url.substring(1);
    var test_filename = request.file.originalname;
    
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
			//Don't allow test submission after test has ended
            client.query('UPDATE test_instances SET latest_submission = $1, submission_filename = $2 WHERE url = $3 AND end_time > now()',
				[test_data, test_filename, test_url],
				function(err, result) {
					done();
					if (err) {
						console.error(err);
						error_message = err;
						success = false;
						// success_title = test_name;
						response.redirect('#');
					}
					else { 
                        console.log('removing file from uploads');
						//first unlink/remove the file we added to uploads/
						fs.unlink(request.file.path);
						//then redirect back to the test page
						success = true;
						success_filename = test_filename;
						response.redirect('#');
					}
			});
        });
    });
});

//admin page get method
admin.get('/', function(request, response) {
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
		
		var current_success_url = success_url;
		success_url = null;
		
		var current_error_message = error_message;
		error_message = null;
		
		//TODO: look into async.js module for this crap
		response.render('pages/admin', {test_array: test_array, test_instances_array: test_instances_array, success: current_success, success_title: current_success_title, success_url: current_success_url, error_message: current_error_message});
	}
    
    //Query the tables so we can show admins the data
    pg.connect(process.env.DATABASE_URL, function(err, client, done) {
		if (err) {
			return console.error(err);
		}
		//Query tests table for everything but the file
		client.query('SELECT title, description FROM tests ORDER BY title', function(err, result) {
			done();
			if (err) {
				console.error(err);
				response.send("Error " + err);
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
		client.query('SELECT name, email, test_title, start_time, end_time, url FROM test_instances ORDER BY name ASC NULLS LAST, email ASC NULLS FIRST', function(err, result) {
			done();
			if (err) {
				console.error(err);
				response.send("Error " + err); 
			}
			else {
				test_instances_array = result.rows;
				
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

//create page get method
admin.get('/create', function(request, response) {
	response.render('pages/create');
});

//create page post method
admin.post('/create', upload.single('select_file'), function(request, response, next) {
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
						// success_title = test_name;
						response.redirect(adminURL);
					}
					else { 
						//first unlink/remove the file we added to uploads/
						fs.unlink(request.file.path);
						//then redirect back to the admin page
						success = true;
						success_title = test_name;
						response.redirect(adminURL);
					}
			});
        });
    });
});

//schedule page get method
admin.get('/schedule', function(request, response) {
	response.render('pages/schedule', {test_title: request.query.testname});
});

//schedule page post method
admin.post('/schedule', function(request, response, next) {
    var candidate_name = request.body.candidatename == '' ? null : request.body.candidatename;
    var candidate_email = request.body.candidateemail == '' ? null : request.body.candidateemail;
    var start_time = request.body.starttime;
    var end_time = request.body.endtime;
    var test_name = request.body.testtitle;
    
    //Using crypto for the url should always result in a unique base64 string
	//190 bytes results in 256 char string
	//TODO: make sure this is not already in db just in case
    var test_url = crypto.pseudoRandomBytes(190).toString('base64')
		.replace(/\//g,'_').replace(/\+/g,'-');
    
    pg.connect(process.env.DATABASE_URL, function(err, client, done) {
		if (err) {
			return console.error(err);
		}
        client.query('INSERT INTO test_instances (name, email, test_title, start_time, end_time, url) VALUES ($1, $2, $3, $4, $5, $6)',
			[candidate_name, candidate_email, test_name, start_time, end_time, test_url],
			function(err, result) {
				done();
				if (err) {
					console.error(err);
					error_message = err;
					success = false;
					// success_title = test_name;
					response.redirect(adminURL);
				}
				else {
					//then redirect back to the admin page
					success = true;
					success_title = test_name;
					success_url = request.headers.origin + testURL + test_url;
					response.redirect(adminURL);
				}
		});
    });
});

//reschedule page get method
admin.get('/reschedule/*', function(request, response) {
	//test_url is everything after /reschedule/
	var test_url = request.url.substring(12);
	
	pg.connect(process.env.DATABASE_URL, function(err, client, done) {
		if (err) {
			return console.error(err);
		}
		//Query tests table for everything but the file
		client.query('SELECT test_title, start_time, end_time, name, email FROM test_instances WHERE url = $1', [test_url], function(err, result) {
			done();
			if (err) {
				console.error(err);
					error_message = err;
					success = false;
					// success_title = test_name;
					response.redirect(adminURL);
			}
			else {
				var inst = result.rows;
				if (inst.length < 1) {
					error_message = 'Error rescheduling test. There is no test that matches the URL extension ' + test_url;
					success = false;
					response.redirect(adminURL);
				}
				else {
					if (new Date(inst[0].end_time) < new Date()) {
						error_message = 'Error. That test has ended and connot be rescheduled.';
						success = false;
						response.redirect(adminURL);
					}
					else {
						response.render('pages/reschedule', {test_instance: inst[0]});
					}
				}
			}
		});
	});
});

//reschedule page post method
admin.post('/reschedule/*', function(request, response, next) {
	//test_url is everything after /reschedule/
	var test_url = request.url.substring(12);
    var candidate_name = request.body.candidatename == '' ? null : request.body.candidatename;
    var candidate_email = request.body.candidateemail == '' ? null : request.body.candidateemail;
    var start_time = request.body.starttime;
    var end_time = request.body.endtime;
    var test_name = request.body.testtitle;
    
    pg.connect(process.env.DATABASE_URL, function(err, client, done) {
		if (err) {
			return console.error(err);
		}
        client.query('UPDATE test_instances SET name = $1, email = $2, start_time = $3, end_time = $4 WHERE url = $5',
			[candidate_name, candidate_email, start_time, end_time, test_url],
			function(err, result) {
				done();
				if (err) {
					console.error(err);
					error_message = err;
					success = false;
					// success_title = test_name;
					response.redirect(adminURL);
				}
				else {
					//then redirect back to the admin page
					success = true;
					success_title = test_name;
					success_url = request.headers.origin + testURL + test_url;
					response.redirect(adminURL);
				}
		});
    });
});

//view page get method
admin.get('/view', function(request, response, next) {
	test_title = request.query.testname;
	
	pg.connect(process.env.DATABASE_URL, function(err, client, done) {
		if (err) {
			return console.error(err);
		}
        client.query('SELECT instructions FROM tests WHERE title = $1', 
			[test_title],
			function(err, result) {
				done();
				if (err) {
					console.error(err);
					error_message = err;
					success = false;
					// success_title = test_name;
					response.redirect(adminURL);
				}
				else {
					if (result.rows.length < 1) {
						success = false;
						error_message = 'Error viewing test. The test "' + test_title + '" doesn\'t exist.';
						response.redirect(adminURL);
					}
					else {
						response.setHeader('Content-disposition', 'inline; filename="' + test_title + '.pdf"');
						response.setHeader('Content-type', 'application/pdf');
						response.send(result.rows[0].instructions);
					}
				}
		});
    });
});

//download page get method
admin.get('/download/*', function(request, response, next) {
	//test_url is everything after /download/
	var test_url = request.url.substring(10);
	
	pg.connect(process.env.DATABASE_URL, function(err, client, done) {
		if (err) {
			return console.error(err);
		}
        client.query('SELECT latest_submission, submission_filename FROM test_instances WHERE url = $1', 
			[test_url],
			function(err, result) {
				done();
				if (err) {
					console.error(err);
					error_message = err;
					success = false;
					// success_title = test_name;
					response.redirect(adminURL);
				}
				else {
					if (result.rows.length < 1 || result.rows[0].latest_submission == null || result.rows[0].submission_filename == null) {
						success = false;
						error_message = 'Error downloading test submission. There is no submission that matches the URL extension ' + test_url;
						response.redirect(adminURL);
					}
					else {
						response.setHeader('Content-disposition', 'inline; filename="' + result.rows[0].submission_filename + '"');
						// response.setHeader('Content-type', 'application/pdf');
						response.send(result.rows[0].latest_submission);
					}
				}
		});
    });
});

//redirects bad url extensions to default page
app.get('/*', function (request, response) {
	response.redirect('/');
});

//log when app has started
app.listen(app.get('port'), function() {
	console.log('Node app is running on port', app.get('port'));
});
