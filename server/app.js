var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var bodyParser = require('body-parser');
var mysql = require('mysql');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const { send } = require('process');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public','web_app')));

// database connection setup
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'schooldb'
});

connection.connect((error)=>{
  if(error){
    return(console.error('error: '+error.message))
  }
  else{
    console.log('connection success');
  }
});

// session set up
app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true
}));
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());


// app.use('/', indexRouter);
// app.use('/users', usersRouter);

app.get('/', function(req, res, next) {
  res.sendFile(path.join(__dirname,'/public/web_app','login_page.html'));
});

app.get('/main', (req,res)=>{
  if(req.session.loggedIn){
    res.send('test success'+req.session.userId);
  }
  else{
    res.redirect('/');
  }
  res.end();
});


app.post('/login',(req,res)=>{
  var userId = req.body.userId;
  var password = req.body.password;
  if(userId && password) {
    connection.query('SELECT* FROM user_tbl WHERE user_id = ? AND user_password = ?',[userId,password],(error,results,field)=>{
      if(error){
        console.error(error);
      } 

      else if(results.length > 0) {
          req.session.loggedIn = true;
          req.session.userId = userId;
          res.redirect('/main');
        }else{
          res.redirect('/');
        }
        res.end();
    });
  }else{
    res.redirect('/');
  }
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
