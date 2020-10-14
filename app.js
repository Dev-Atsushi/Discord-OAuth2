const express  = require('express');

const session  = require('express-session');

const app = express();

const passport = require('passport');

const Strategy = require('./lib/strategy.js').Strategy;

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

    clientID: 'ID de seu bot',

    clientSecret: 'ClientSecret de seu bot',

    callbackURL: 'https://Seu site/callback',

    scope: scopes

}, function(accessToken, refreshToken, profile, done) {

    process.nextTick(function() {

        return done(null, profile);

    });

}));

app.use(passport.initialize());

app.use(passport.session())

function checkHttps(req, res, next){
// protocolo, se for http -> redireciona para https
  if(req.get('X-Forwarded-Proto').indexOf("https")!=-1){
    console.log("é https")
    return next()
} else {
    console.log("é http redirecionando!")
    res.redirect('https://' + req.hostname + req.url);
}
}
  app.all('*', checkHttps)
  app.use(express.static("public"));


app.get('/', function (req, res) {
res.render('index.ejs', {
    logged: req.user ? true : false,
    username: req.user ? req.user.username : '',
   avatar: req.user ? `https://cdn.discordapp.com/avatars/${req.user.id}/${req.user.avatar}` : ''
}) 
});

app.get('/login', passport.authenticate('discord', { scope: scopes }), function(req, res) {});

app.get('/callback', passport.authenticate('discord', { failureRedirect: '/' }), function(req, res) { res.redirect('/') } );

app.get('/logout', function(req, res) {

    req.logout();

    res.redirect('/');

});
app.listen(3000, function (err) {
   console.log("Listening on: 3000");
})
