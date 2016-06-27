var express = require('express'),
    cookieSession = require('cookie-session'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    morganLogger = require('morgan'),
    passport = require('passport'),
    ForceDotComStrategy = require('passport-forcedotcom').Strategy;

var app = express();
var test = express();
var admin = express();

//for file stuff
var fs = require('fs');

//for postgresql
var pg = require('pg');
pg.defaults.ssl=true;

//for unique url extensions
var crypto = require('crypto');

//for reporting success and failure
//These are checked by pages that are redirected to after a post method is processed
//If it is successful or not, based on what was attempted, different info will be needed by the page
var success = null;
var success_title = null;
var success_url = null;
var success_filename = null;
var error_message = null;
var fail_body = null;
//These could also be done using session cookies

//set up support for handling post reqs
var bodyParser = require('body-parser');
app.use(bodyParser.json());     // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({ // to support URL-encoded bodies
    extended: true
}));
var multer = require('multer');
var upload = multer({dest:'uploads/'});

//URL paths for links
var testURL = '/test/';
var adminURL = '/admin/'
var createURL = '/admin/create/';
var scheduleURL = '/admin/schedule/';
var rescheduleURL = '/admin/reschedule/';
var viewURL = '/admin/view/';
var downloadURL = '/admin/download/';
var authErrorURL = '/admin/error/';

//set where files are
app.use(express.static('public'));
app.use(morganLogger());
app.use(cookieParser());
app.use(bodyParser());
app.use(cookieSession({ secret: 'keyboard cat' }));
app.use(passport.initialize());
app.use(passport.session());

//mount the sub apps
app.use('/test', test);
app.use('/admin', admin);

// OAuth2 + Setup against GUS
passport.use(new ForceDotComStrategy({
  clientID: process.env.OAUTH_ID,
  clientSecret: process.env.OAUTH_SECRET,
  scope: ['id'],
  callbackURL: 'https://polar-cove-10019.herokuapp.com/admin/oauth/forcedotcom/callback'
}, function verify(token, refreshToken, profile, done) {
  console.log("Logged in with profile: " + profile);
  return done(null, profile);
}));

// Serialize / Deserialize the whole user profile
passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    done(null, user);
});

//views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

//default page set to redirect to admin
app.get('/', function(req, res) {
    res.redirect(adminURL);
});

admin.get('/login', function(req, res) {
  req.logout();

  res.render('pages/login', {
    user: req.user
  });
});

admin.get('/logout', function(req, res) {
  res.redirect('/admin/login');
});

admin.get("/oauthguarded", ensureAuthenticated,
    function(req, res) {
        console.log("Rendering oauthguarded");
        res.render("pages/oauthguarded");
    }
);

// GET /auth/forcedotcom
//   Use passport.authenticate() as route middleware to authenticate the
//   req.  The first step in Force.com authentication will involve
//   redirecting the user to your domain.  After authorization, Force.com will
//   redirect the user back to this application at /auth/forcedotcom/callback
admin.get('/oauth/forcedotcom', passport.authenticate('forcedotcom'), function(req, res) {
    console.log("Hit force auth stub");
    // The req will be redirected to Force.com for authentication, so this
    // function will not be called.
});

admin.get("/oauth/forcedotcom/callback", passport.authenticate('forcedotcom', { failureRedirect: '/error' }),
    function(req, res){
        console.log("Redirecting to /oauthguarded after the oauth callback");
        res.redirect("/admin");
    }
);

admin.get("/error", function(req, res) {
    res.render("pages/oauthError");
});

//admin get method
admin.get('/', function(req, res) {

    if(!req.user) {
        req.logout();
        console.log("User tried visiting /admin without being authenticated. Sending them to login");
        return res.redirect('/admin/login');
    }

    //Create variables to hold the values from the tables
    var test_array = [];
    var test_instances_array = [];

    //add a flag to check if the first query finished
    //since this is viewed in two queries, there is a chance of having a race condition
    //the race condition should result in the page never loading
    //TODO: if this is still a concern, look into the async.js module time permitting
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
        
        //Replace wacks in title and description with wack wack
        test_array.forEach(function(val, i) {
            if (test_array[i].title != null) test_array[i].title = val.title.replace(/\\/g, '\\\\');
            if (test_array[i].description != null) test_array[i].description = val.description.replace(/\\/g, '\\\\');
        });
        
        //Replace wacks in name, email, title, and filename with wack wack
        test_instances_array.forEach(function(val, i) {
            if (test_instances_array[i].name != null) test_instances_array[i].name = val.name.replace(/\\/g, '\\\\');
            if (test_instances_array[i].email != null) test_instances_array[i].email = val.email.replace(/\\/g, '\\\\');
            if (test_instances_array[i].test_title != null) test_instances_array[i].test_title = val.test_title.replace(/\\/g, '\\\\');
            if (test_instances_array[i].submission_filename != null) test_instances_array[i].submission_filename = val.submission_filename.replace(/\\/g, '\\\\');
        });
        
        res.render('pages/admin', {test_array: test_array, test_instances_array: test_instances_array, success: current_success, success_title: current_success_title, success_url: current_success_url, error_message: current_error_message});
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
                res.send("Error " + err.detail);
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
        client.query('SELECT name, email, test_title, start_time, end_time, url, submission_filename FROM test_instances ORDER BY name ASC NULLS LAST, email ASC NULLS FIRST', function(err, result) {
            done();
            if (err) {
                console.error(err);
                res.send("Error " + err.detail); 
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

//create get method
admin.get('/create', ensureAuthenticated, function(req, res) {
    var current_success = success;
    success = null;
    
    var current_fail_body = fail_body;
    fail_body = null;
    
    var current_error_message = error_message;
    error_message = null;
    
    res.render('pages/create', {success: current_success, error_message: current_error_message, fail_body: current_fail_body});
});

//create post method
admin.post('/create', ensureAuthenticated, upload.single('select_file'), function(req, res, next) {
    var test_name = req.body.title;
    var test_description = req.body.description;
    //needed for bytea
    var test_data = '\\x';
    //time to read the file
    fs.readFile(req.file.path, 'hex', function (err,data) {
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
                        error_message = err.detail;
                        success = false;
                        fail_body = req.body;
                        res.redirect(createURL);
                    }
                    else { 
                        //first unlink/remove the file we added to uploads/
                        fs.unlink(req.file.path);
                        
                        //then redirect back to the admin page
                        success = true;
                        success_title = test_name;
                        res.redirect(adminURL);
                    }
            });
        });
    });
});

//schedule get method
admin.get('/schedule', ensureAuthenticated, function(req, res) {
    var current_success = success;
    success = null;
    
    var current_fail_body = fail_body;
    fail_body = null;
    
    var current_error_message = error_message;
    error_message = null;
    
    var test_title = req.query.testname;
    
    pg.connect(process.env.DATABASE_URL, function(err, client, done) {
        if (err) {
            return console.error(err);
        }
        //Query tests table for test_title
        client.query('SELECT title FROM tests WHERE title = $1', [test_title], function(err, result) {
            done();
            if (err) {
                console.error(err);
                    error_message = err.detail;
                    success = false;
                    res.redirect(adminURL);
            }
            else {
                var inst = result.rows;
                if (inst.length < 1) {
                    error_message = 'Error scheduling test. There is no test titled ' + test_title;
                    success = false;
                    res.redirect(adminURL);
                }
                else {
                    res.render('pages/schedule', {test_title: test_title, success: current_success, error_message: current_error_message, fail_body: current_fail_body});
                }
            }
        });
    });
    
});

//schedule post method
admin.post('/schedule', ensureAuthenticated, function(req, res, next) {
    //get all of the form values
    var candidate_name = req.body.candidatename == '' ? null : req.body.candidatename;
    var candidate_email = req.body.candidateemail == '' ? null : req.body.candidateemail;
    var start_time = req.body.starttime;
    var end_time = req.body.endtime;
    var test_name = req.body.testtitle;
    
    //set the recursive limit and set the success_url it redirects to
    var recursion_limit = 5;
    success_url = req.headers.origin + testURL;
    //call to the function preforming the query
    scheduleSubmission(req, res, candidate_name, candidate_email, start_time, end_time, test_name, recursion_limit);
    
});

//reschedule get method
admin.get('/reschedule/*', ensureAuthenticated, function(req, res) {
    var current_success = success;
    success = null;
    
    var current_fail_body = fail_body;
    fail_body = null;
    
    var current_error_message = error_message;
    error_message = null;
    
    //test_url is everything after /reschedule/
    var test_url = req.url.substring(12);
    
    pg.connect(process.env.DATABASE_URL, function(err, client, done) {
        if (err) {
            return console.error(err);
        }
        //Query tests table for everything but the file
        client.query('SELECT test_title, start_time, end_time, name, email FROM test_instances WHERE url = $1', [test_url], function(err, result) {
            done();
            if (err) {
                console.error(err);
                    error_message = err.detail;
                    success = false;
                    res.redirect(adminURL);
            }
            else {
                var inst = result.rows;
                if (inst.length < 1) {
                    error_message = 'Error rescheduling test. There is no test that matches the URL extension ' + test_url;
                    success = false;
                    res.redirect(adminURL);
                }
                else {
                    //Replace wack in name and email with wack wack
                    if (inst[0].name != null) inst[0].name = inst[0].name.replace(/\\/g, '\\\\');
                    if (inst[0].email != null) inst[0].email = inst[0].email.replace(/\\/g, '\\\\');
                    
                    res.render('pages/reschedule', {test_instance: inst[0], success: current_success, error_message: current_error_message, fail_body: current_fail_body});
                }
            }
        });
    });
});

//reschedule post method
admin.post('/reschedule/*', ensureAuthenticated, function(req, res, next) {
    //test_url is everything after /reschedule/
    var test_url = req.url.substring(12);
    var candidate_name = req.body.candidatename == '' ? null : req.body.candidatename;
    var candidate_email = req.body.candidateemail == '' ? null : req.body.candidateemail;
    var start_time = req.body.starttime;
    var end_time = req.body.endtime;
    var test_name = req.body.testtitle;
    
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
                    error_message = err.detail;
                    success = false;
                    fail_body = req.body;
                    res.redirect(rescheduleURL);
                }
                else {
                    //then redirect back to the admin page
                    success = true;
                    success_title = test_name;
                    success_url = req.headers.origin + testURL + test_url;
                    res.redirect(adminURL);
                }
        });
    });
});

//view get method
admin.get('/view', ensureAuthenticated, function(req, res, next) {
    test_title = req.query.testname;
    
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
                    error_message = err.detail;
                    success = false;
                    res.redirect(adminURL);
                }
                else {
                    if (result.rows.length < 1) {
                        success = false;
                        error_message = 'Error viewing test. The test "' + test_title + '" doesn\'t exist.';
                        res.redirect(adminURL);
                    }
                    else {
                        res.setHeader('Content-disposition', 'inline; filename="' + test_title + '.pdf"');
                        res.setHeader('Content-type', 'application/pdf');
                        res.send(result.rows[0].instructions);
                    }
                }
        });
    });
});

//download get method
admin.get('/download/*', ensureAuthenticated, function(req, res, next) {
    //test_url is everything after /download/
    var test_url = req.url.substring(10);
    
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
                    error_message = err.detail;
                    success = false;
                    res.redirect(adminURL);
                }
                else {
                    if (result.rows.length < 1 || result.rows[0].latest_submission == null || result.rows[0].submission_filename == null) {
                        success = false;
                        error_message = 'Error downloading test submission. There is no submission that matches the URL extension ' + test_url;
                        res.redirect(adminURL);
                    }
                    else {
                        res.setHeader('Content-disposition', 'inline; filename="' + result.rows[0].submission_filename + '"');
                        res.send(result.rows[0].latest_submission);
                    }
                }
        });
    });
});

//test page index
test.get('/', function(req, res) {
    res.render('pages/index');
});

//test get method
test.get('/*', function(req, res) {
    //test_url is everything after last /
    var test_url = req.url.substring(1);
    
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
                res.send("Error " + err);
            }
            else {
                var inst = result.rows;
                if (inst.length < 1 || new Date(inst[0].start_time) > new Date() || new Date(inst[0].end_time) < new Date()) {
                    res.redirect(testURL);
                }
                else {
                    //to pass pdf information and use it in JavaScript we must first convert it to a string
                    var instr_str = inst[0].instructions.toString("base64");
                    res.render('pages/test', {test_instance: inst[0], instr_data: instr_str, success: current_success, success_filename: current_success_filename, error_message, current_error_message});
                }
            }
        });
    });
});

//test post method
test.post('/*', upload.single('select_file'), function(req, res, next) {
    var test_data = '\\x';
    var test_url = req.url.substring(1);
    var test_filename = req.file.originalname;
    
    //time to read the file
    fs.readFile(req.file.path, 'hex', function (err,data) {
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
                        error_message = err.detail;
                        success = false;
                        res.redirect('#');
                    }
                    else { 
                        console.log('removing file from uploads');
                        //first unlink/remove the file we added to uploads/
                        fs.unlink(req.file.path);
                        
                        //then redirect back to the test page
                        success = true;
                        success_filename = test_filename;
                        res.redirect('#');
                    }
            });
        });
    });
});


//redirects bad url extensions to default page
app.get('/*', function (req, res) {
    console.log("App catch-all");
    res.redirect('/');
});


// Start the HTTPS Server
var httpPort = (process.env.PORT || 5000)
var http = require('http');

http.createServer(sslOpts, app).listen(httpsPort, function() {
    console.log('Node app is running on port', httpsPort);
});

var httpsPort = (process.env.HTTPS_PORT || 5001)
var https = require('https');
var privateKey  = fs.readFileSync('sslcert/server.key', 'utf8');
var certificate = fs.readFileSync('sslcert/server.crt', 'utf8');
var sslOpts = { key: privateKey, cert: certificate};

https.createServer(sslOpts, app).listen(httpsPort, function() {
    console.log('Node app is running on port', httpsPort);
});


//log when app has started
/*
app.listen(app.get('port'), function() {
    console.log('Node app is running on port', app.get('port'));
});
*/


/*
    Functions used in above GET and POST methods
*/

//This function tries to create a unique url then inserts a new scheduled test instance into our database
//If it fails to create a unique url it recursively calls its self again. Doing so inside the query ensures async execution
//There is a limit variable in case the query fails for a different reason and gets stuck recursively calling itself
function scheduleSubmission(req, res, candidate_name, candidate_email, start_time, end_time, test_name, recursion_limit) {
    //Using crypto for the url should always result in a unique base64 string
    //190 bytes results in 256 char string
    var test_url = crypto.pseudoRandomBytes(190).toString('base64').replace(/\//g,'_').replace(/\+/g,'-');
    
    pg.connect(process.env.DATABASE_URL, function(err, client, done) {
        if (err) {
            return console.error(err);
        }
        client.query('INSERT INTO test_instances (name, email, test_title, start_time, end_time, url) VALUES ($1, $2, $3, $4, $5, $6)',
            [candidate_name, candidate_email, test_name, start_time, end_time, test_url],
            function(err, result) {
                done();
                if (err) {
                    //If we have not hit the recursion limit, and we failed, try again. Otherwise, send res
                    if(recursion_limit < 1) {
                        console.error(err);
                        error_message = err.detail;
                        success = false;
                        fail_body = req.body;
                        res.redirect(scheduleURL + '?testname=' + test_name);
                    }
                    else {   
                        // reduce the recursion limit!
                        scheduleSubmission(req, res, candidate_name, candidate_email, start_time, end_time, test_name, recursion_limit - 1); 
                    }
                }
                else {
                    //then redirect back to the admin page
                    success = true;
                    success_title = test_name;
                    success_url = success_url + test_url;
                    res.redirect(adminURL);
                }
        });
    });
}

// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the req is authenticated (typically via a persistent login session),
//   the req will proceed.  Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
  if(req.isAuthenticated()) {
    return next();
  }
  console.log("Hit ensureAuthenticated guard. Sending to /admin/login");
  res.redirect('/admin/login');
}
