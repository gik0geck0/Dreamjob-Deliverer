var express = require('express');
var cookieSession = require('cookie-session');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var app = express();

//for file stuff
var fs = require('fs');

//views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

// OAuth2 + Setup against GUS
var passport = require('passport'),
    ForceDotComStrategy = require('passport-forcedotcom').Strategy;

passport.use(new ForceDotComStrategy({
  clientID: process.env.OAUTH_ID,
  clientSecret: process.env.OAUTH_SECRET,
  scope: ['id'],
  callbackURL: 'https://mbuland-wsl.internal.salesforce.com:5001/oauth/forcedotcom/callback'
}, function verify(token, refreshToken, profile, done) {
  console.log("Logged in with profile: " + JSON.stringify(profile));
  return done(null, profile);
}));

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    done(null, user);
});

app.use(express.static('public'));
app.use(cookieParser());
app.use(bodyParser());
app.use(cookieSession({ secret: 'keyboard cat' }));
app.use(passport.initialize());
app.use(passport.session());

app.get('/', function(req, res) {
  console.log(req.user);
  if(!req.user) {
    req.logout();
    return res.redirect('/login');
  }
  res.redirect('/oauthguarded');
});

app.get('/login', function(req, res) {
  req.logout();

  res.render('pages/login', {
    user: req.user
  });
});

app.get('/logout', function(req, res) {
  res.redirect('/login');
});

app.get("/oauthguarded", ensureAuthenticated,
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
app.get('/oauth/forcedotcom', passport.authenticate('forcedotcom'), function(req, res) {
  // The req will be redirected to Force.com for authentication, so this
  // function will not be called.
});

app.get("/oauth/forcedotcom/callback",
    passport.authenticate('forcedotcom', { failureRedirect: '/error' }),
    function(req, res){
        console.log("Redirecting to /oauthguarded after the oauth callback");
        res.redirect("/");
    }
);

app.get("/error", function(req, res) {
    res.render("pages/oauthError");
});

// app.use(passport.initialize());
// app.use(passport.session());

//views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

// Start the HTTPS Server
var https = require('https');
var privateKey  = fs.readFileSync('sslcert/server.key', 'utf8');
var certificate = fs.readFileSync('sslcert/server.crt', 'utf8');
var sslOpts = { key: privateKey, cert: certificate};

https.createServer(sslOpts, app).listen(5001, function() {
    console.log('Node app is running on port', 5001);
});

// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the req is authenticated (typically via a persistent login session),
//   the req will proceed.  Otherwise, the user will be redirected to the
//   login page.

function ensureAuthenticated(req, res, next) {
  if(req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}
