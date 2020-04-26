if (process.env.NODE_ENV !== 'production'){
    require('dotenv').config();
}

const express = require('express'),
      app = express(),
      port = process.env.PORT || 3000,
      bcrypt = require('bcrypt'),
      passport = require('passport'),
      initializePassport = require('./passport-config'),
      flash = require('express-flash'),
      session = require('express-session'),
      methodOverride = require('method-override'),
      users = []

initializePassport(passport,
     email => users.find(user => user.email === email),
     id => users.find(user =>  user.id === id)
);
require('ejs');

app.set('view engine', 'ejs');
app.use(express.urlencoded({extended : false}));
app.use(flash());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride('_method'));

app.get('/', checkLogged, (req, res) => {
    res.render('index', {name: ""});
});

app.get('/login', checkNotLogged, (req, res) => {
    res.render('login', {});
});

app.get('/register', checkNotLogged, (req, res) => {
    res.render('register', {});
});

app.post('/register', checkNotLogged, async (req, res) => {
    try{
        hashedPassword = await bcrypt.hash(req.body.password, 10);
        users.push({
            id: Date.now().toString(),
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword
        });
        res.redirect('/login')
    }
    catch{
        res.redirect('/register')
    }
});

app.post('/login', checkNotLogged, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}));

app.delete('/logout', (req, res) => {
    req.logOut()
    res.redirect('/login')
});

app.listen(port, () => {
    console.log('serwer wystartowal')
});

function checkLogged(req, res, next){
    if (req.isAuthenticated()){
        return next();
    }
    res.redirect('/login');
}

function checkNotLogged(req, res, next){
    if (req.isAuthenticated()){
        return res.redirect('/')
    }
    next()
}