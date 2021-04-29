const express       = require('express');
const session       = require('express-session');
const app           = express();
const passport      = require('passport');
const Strategy      = require('./lib/Strategy.js').Strategy;
const { checkAuth } = require('./utils/checkAuth.js');

app.use(session({
    secret: 'youshallnotpass',
    resave: false,
    saveUninitialized: false
}));

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

const scopes = ['identify', 'guilds'];
passport.use(new Strategy({
    clientID: 'ClientID',
    clientSecret: 'Client Secret',
    callbackURL: 'https://yourwebsite.com/callback',
    scope: scopes
}, function(accessToken, refreshToken, profile, done) {
    process.nextTick(function() {
        return done(null, profile);
    });
}));

app.use(passport.initialize());
app.use(passport.session())
app.use(express.static("public"));

app.get('/', function (req, res) {
    res.render('index.ejs', {
        logged: req.user ? true : false,
        username: req.user ? req.user.username : '',
        avatar: req.user ? `https://cdn.discordapp.com/avatars/${req.user.id}/${req.user.avatar}` : ''
    });
});

app.get('/login', passport.authenticate('discord', { scope: scopes }), function(req, res) {});
app.get('/callback', passport.authenticate('discord', { failureRedirect: '/' }), function(req, res) { res.redirect('/') } );

app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});

app.listen(3000, function (err) {
   console.log("Listening on: 3000");
});
