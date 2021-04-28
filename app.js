require('dotenv').config();
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
app.use(express.static('public'));

const MongoStore = require('connect-mongo');
app.use(session({
  store: MongoStore.create({mongoUrl: process.env.DATABASE_URL}),
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect(process.env.DATABASE_URL, {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.set("useCreateIndex", true);

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  nama: String,
  npm: Number,
  ttl: String,
  tgl: Date,
  agama: String,
  hp: String,
  goldar: String,
  email: String,
  rumah: String,
  kos: String,
  pend: String,
  panitia: String,
  organisasi: String,
  pelatihan: String,
  prestasi: String,
  role: String
});

userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model('User', userSchema);

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get('/', function(req, res){
  var role;
  var nama;
  if(req.isAuthenticated()){
    role = req.user.role;
    nama = req.user.nama;
  }
  res.render('home', {loggedIn: req.isAuthenticated(), user: role, nama: nama});
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

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

app.get('/dbs', function(req, res){
  if(req.isAuthenticated()){
    if(req.user.role === "admin"){
      User.find({"nama": {$ne: null}}, function(err, foundUser){
        if(err){
          console.log(err);
        }
        else{
          res.render('dbs', {user: foundUser});
        }
      });
    }
    else{
      res.redirect('/');
    }
  }
  else{
    res.redirect('/login');
  }
});

app.get('/profile', function(req, res){
  if(req.isAuthenticated()){
    var user = req.user
    if(req.user.nama !== null){
      res.render('profile', {user: user});
    }
    else{
      res.redirect('/');
    }
  }
  else{
    res.redirect('login');
  }
});

app.post('/signup', function(req, res){
  User.register({username: req.body.username}, req.body.password, function(err, user){
    if(err){
      console.log(err);
      res.redirect('/signup');
    }
    else{
      passport.authenticate('local', {failureFlash: true, failureRedirect: '/signup'})(req, res, function(){
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
      passport.authenticate('local', {failureRedirect: '/login'})(req, res, function(){
        res.redirect('/');
      });
    }
  });
});

app.post('/form', function(req, res){
  const nama = req.body.nama;
  const npm = req.body.npm;
  const ttl = req.body.ttl;
  const tgl = req.body.tgl;
  const agama = req.body.agama;
  const goldar = req.body.goldar;
  const hp = req.body.hp;
  const email = req.body.email;
  const rumah = req.body.rumah;
  const kos = req.body.kos;
  const pendidikan = req.body.pendidikan;
  const panitia = req.body.panitia;
  const organisasi = req.body.organisasi;
  const pelatihan = req.body.pelatihan;
  const prestasi = req.body.prestasi;

  User.findById(req.user.id, function(err, foundUser){
    if (err) {
      console.log(err);
    } else {
      if (foundUser) {
        foundUser.nama = nama;
        foundUser.npm = npm;
        foundUser.ttl = ttl;
        foundUser.tgl = tgl;
        foundUser.agama = agama;
        foundUser.goldar = goldar;
        foundUser.hp = hp;
        foundUser.email = email;
        foundUser.rumah = rumah;
        foundUser.kos = kos;
        foundUser.pendidikan = pendidikan;
        foundUser.panitia = panitia;
        foundUser.organisasi = organisasi;
        foundUser.pelatihan = pelatihan;
        foundUser.prestasi = prestasi;
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
        alert('User tidak ditemukan.');
        res.redirect('/');
      }
    }
  });
});

app.post('/profile', function(req, res){
  const namaBaru = req.body.nama;
  const npmBaru = req.body.npm;
  const ttlBaru = req.body.ttl;
  const tglBaru = req.body.tgl;
  const agamaBaru = req.body.agama;
  const goldarBaru = req.body.goldar;
  const hpBaru = req.body.hp;
  const emailBaru = req.body.email;
  const rumahBaru = req.body.rumah;
  const kosBaru = req.body.kos;
  const pendidikanBaru = req.body.pendidikan;
  const panitiaBaru = req.body.panitia;
  const organisasiBaru = req.body.organisasi;
  const pelatihanBaru = req.body.pelatihan;
  const prestasiBaru = req.body.prestasi;

  User.findById(req.user.id, function(err, foundUser){
    if (err) {
      console.log(err);
    } else {
      if (foundUser) {
        foundUser.nama = namaBaru;
        foundUser.npm = npmBaru;
        foundUser.ttl = ttlBaru;
        foundUser.tgl = tglBaru;
        foundUser.agama = agamaBaru;
        foundUser.goldar = goldarBaru;
        foundUser.hp = hpBaru;
        foundUser.email = emailBaru;
        foundUser.rumah = rumahBaru;
        foundUser.kos = kosBaru;
        foundUser.pendidikan = pendidikanBaru;
        foundUser.panitia = panitiaBaru;
        foundUser.organisasi = organisasiBaru;
        foundUser.pelatihan = pelatihanBaru;
        foundUser.prestasi = prestasiBaru;
        foundUser.save(function(){
          res.redirect("/");
        });
      }
    }
  });
});

app.listen(process.env.PORT || 2000, function(){
  console.log("2000 ready");
});
