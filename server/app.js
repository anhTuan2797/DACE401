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
const { error } = require('console');
const { json } = require('express');

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
var connection = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'schooldb'
});

// connection.connect((error)=>{
//   if(error){
//     return(console.error('error: '+error.message))
//   }
//   else{
//     console.log('databse connection success');
//   }
// });

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
    // res.send(req.session.userId);
    res.cookie('userId',req.session.userId);
    res.sendFile(path.join(__dirname,'/public/web_app','class_detail_page.html'));
  }
  else{
    res.redirect('/');
  }
  // res.sendFile(path.join(__dirname,'/public/web_app','class_detail_page.html'));
  // res.end();
});

app.get('/getUser',(req,res)=>{
  console.log('get user message received '+req.session.userId);
  var userId= req.session.userId;
  var userJob = req.session.userJob;
  if(userId && userJob == 'student'){
    connection.query('SELECT student_name FROM student_tbl WHERE student_id = ?',[userId],(error,results,field)=>{
      if(error){
        console.error(error);
      }
      else if(results.length > 0){
        results[0].job = req.session.userJob;
        var text = JSON.stringify(results[0]);
        res.status(200).send(text);
      }
    });
  } else if(userId && userJob == 'teacher'){
        connection.query('SELECT teacher_name FROM teacher_tbl WHERE teacher_id = ?',[userId],(error,results,field)=>{
          if(error){
            console.error(error);
          }
          else if(results.length > 0){
            results[0].job = req.session.userJob;
            var text = JSON.stringify(results[0]);
            res.status(200).send(text);
          }
        });
  }
});


app.get('/getClass',(req,res)=>{
  console.log('get class message received '+req.session.userId);
  var userId = req.session.userId;
  var userJob = req.session.userJob;
  if(userId && userJob == 'student'){
    connection.query('SELECT class_id FROM class_detail_tbl WHERE student_id = ?',[userId],(error,results,field)=>{
        if(error){
          console.error(error);
        }
        else if(results.length > 0){
          var text = JSON.stringify(results);
          res.status(200).send(text);
        }
    });
  }
  else if(userId && userJob == 'teacher'){
    connection.query('SELECT class_id FROM class_tbl WHERE teacher_id = ?',[userId],(error,results,field)=>{
        if(error){
          console.error(error);
        }
        else if(results.length > 0){
          var text = JSON.stringify(results);
          res.status(200).send(text);
        }
    });
  }
});

app.get('/getSession',(req,res)=>{
    var classId = req.header('classId');
    if(classId){
      console.log('get session message received');
      console.log(req.header('classId'));
      connection.query('SELECT session_id FROM session_tbl WHERE class_id = ?',[classId],(error,results,field)=>{
          if(error){
            console.error(error);
          }
          else if(results.length > 0){
            var text = JSON.stringify(results);
            res.status(200).send(text);
          }
          else{
            res.status(404).send('cant find data');
            
          }
      });
    } 
    else{
      res.status(404).send('cant find classId')
    }
});

app.get('/getAttendanceStudent',(req,res)=>{
  var classId = req.header('classId');
  var userId = req.session.userId;
  var userJob = req.session.userJob;
    if(classId && userJob == 'student'){
      console.log('get attendance message received');
      console.log("student: " + userId);
      console.log("classId: " + classId);
      connection.query(
        'SELECT attendance_tbl.session_id,attendance_time,session_date FROM attendance_tbl INNER JOIN session_tbl ON attendance_tbl.session_id = session_tbl.session_id AND attendance_tbl.class_id = session_tbl.class_id WHERE student_id = ? AND attendance_tbl.class_id = ?'
      ,[userId,classId],(error,results,field)=>{
        if(error){
          console.error(error);
        }
        else if(results.length > 0){
          var text = JSON.stringify(results);
          res.status(200).send(text);
        }
        else{
          res.status(404).send('cant find data');
        }
      });
    }
    else{
      res.status(404).send('cant find data');
    }
});

app.get('/getAttendanceTeacher',(req,res)=>{
  console.log('get attendance message received');
  var classId = req.header('classId');
  var sessionId = req.header('sessionId');
  var userJob = req.session.userJob;
  if(classId && (userJob == 'teacher') && sessionId) {
    sessionId = parseInt(sessionId);
    console.log('get attendance message received');
    console.log('classId: ' + classId);
    console.log('session: ' +sessionId);
    connection.query(
      'SELECT student_tbl.student_id,student_name,session_date,attendance_time FROM '+ 
      'student_tbl INNER JOIN attendance_tbl ON student_tbl.student_id = attendance_tbl.student_id '+
      'INNER JOIN session_tbl ON attendance_tbl.class_id = session_tbl.class_id and attendance_tbl.session_id = session_tbl.session_id '+
      'where session_tbl.class_id = ? and session_tbl.session_id = ?',
      [classId,sessionId],(error,results,field)=>{
          if(error){
            console.error(error);
            res.status(500).send('database error');
          }
          else if(results.length > 0){
            var text = JSON.stringify(results);
            res.status(200).send(text);
          }
          else{
            res.status(404).send('cant find data');
          }
      });
  }
  else{
    res.status(404).send('cant find data');
  }
});

app.post('/login',(req,res)=>{
  var userId = req.body.userId;
  var password = req.body.password;
  if(userId && password) {
    connection.query('SELECT* FROM student_tbl WHERE student_id = ? AND student_password = ?',[userId,password],(error,results,field)=>{
      // connection.end();
      if(error){
        console.error(error);
      } 

      else if(results.length > 0) {
          req.session.loggedIn = true;
          req.session.userId = userId;
          req.session.userJob = 'student';
          res.redirect('/main');
        } else{
          connection.query('SELECT * FROM teacher_tbl WHERE teacher_id = ? AND teacher_password = ?',[userId,password],(error,results,field)=>{
          // connection.end();
          
            if(error){
              console.error(error);
            }
            else if(results.length > 0) {
              req.session.loggedIn = true;
              req.session.userId = userId;
              req.session.userJob = 'teacher';
              res.redirect('/main');
            }
            else {
              res.redirect('/');
            }
          });
        }
        // res.end();
    });
  } else{
    res.redirect('/');
  }
});

app.get('/logOut',(req,res)=>{
  console.log("log out message received");
  req.session.destroy((error)=>{
    if(error){
      console.error(error);
    }
    else{
      console.log('session destroyed');
      res.status(200).send('log out success');
    }
  })
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
