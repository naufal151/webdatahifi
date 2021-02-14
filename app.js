const express = require('express');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const session = require('express-session');
const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));

app.use(session({
  secret: "hOIDHAdajo#jdoa4)1*dna./aw.",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect('mongodb://localhost:27017/datahifi', {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.set("useCreateIndex", true);

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  fullname: String,
  birthinfo: String,
  enter: String,
  graduate: String,
  address: String,
  job: String
});

userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model('User', userSchema);

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get('/', function(req, res){
  res.render('home');
});

app.get('/login', function(req, res){
  res.render('login');
});

app.get('/signup', function(req, res){
  res.render('signup');
});

app.get('/form', function(req, res){
  if (req.isAuthenticated()){
    User.findById(req.user.id, function(err, foundUser){
      if(err){
        console.log(err);
      }
      else{
        res.render('form', {user: foundUser});
      }
    });
  }
  else{
    res.redirect('/login');
  }
});

app.get('/forgot', function(req, res){
  res.render('forgot');
});

app.post('/signup', function(req, res){
  User.register({username: req.body.username}, req.body.password, function(err, user){
    if(err){
      console.log(err);
      res.redirect('/signup');
    }
    else{
      passport.authenticate('local')(req, res, function(){
        res.redirect('/');
      });
    }
  });
})

app.post('/login', function(req, res){
  const user = new User({
    username: req.body.username,
    password: req.body.password
  });

  req.login(user, function(err){
    if(err){
      console.log(err);
      res.redirect('/login');
    }
    else{
      passport.authenticate('local')(req, res, function(){
        res.redirect('/form');
      });
    }
  });
});

app.post('/form', function(req, res){
  const fullname = req.body.fullname;
  const birthinfo = req.body.birthinfo;
  const enter = req.body.enter;
  const graduate = req.body.graduate;
  const address = req.body.address;
  const job = req.body.job;

  User.findById(req.user.id, function(err, foundUser){
    if (err) {
      console.log(err);
    } else {
      if (foundUser) {
        foundUser.fullname = fullname;
        foundUser.birthinfo = birthinfo;
        foundUser.enter = enter;
        foundUser.graduate = graduate;
        foundUser.address = address;
        foundUser.job = job;
        foundUser.save(function(){
          res.redirect("/");
        });
      }
    }
  });
});

app.post('/forgot', function(req, res){
  const username = req.body.username;
  const password = req.body.password;

  User.findByUsername(username, function(err, foundUser){
    if(err){
      console.log(err);
    }
    else{
      if(foundUser){
        foundUser.setPassword(password, function(){
          foundUser.save();
          res.redirect('/login');
        });
      }
      else{
        res.redirect('/');
      }
    }
  });
});

app.listen(2000, function(){
  console.log("2000 ready");
});
