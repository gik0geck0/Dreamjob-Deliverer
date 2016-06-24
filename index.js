var express = require('express');
var cookieSession = require('cookie-session');
var cookieParser = require('cookie-parser');

var app = express();

//for file stuff
var fs = require('fs');


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
// app.use(express.bodyParser());
app.use(cookieSession({ secret: 'keyboard cat' }));
app.use(passport.initialize());
app.use(passport.session());

app.get("/oauthguarded", passport.authenticate('forcedotcom', { failureRedirect: '/error' }),
    function(req, res) {
        console.log("Rendering oauthguarded");
        response.render("oauthguarded", checkSession(request));
    }
);

app.get("/oauth/forcedotcom/callback",
    passport.authenticate('forcedotcom', { failureRedirect: '/error' }),
    function(request, response){
        console.log("Redirecting to /oauthguarded after the oauth callback");
        response.redirect("/oauthguarded");
    }
);

app.get("/error", function(request, response) {
    response.render("pages/oauthError");
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
