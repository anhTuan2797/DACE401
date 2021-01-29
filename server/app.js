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
const fileUpLoad = require('express-fileupload');
const cors = require('cors');
const _ = require('lodash');
const { LOADIPHLPAPI } = require('dns');

var app = express();
var fs = require('fs')

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
    database: 'schooldb',
    port: 3306
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

app.post('/addStudentToAttendance',(req,res)=>{
  console.log('add student to attendance message received');

  var studentId = req.header('studentId');
  var classId = req.header('classId');
  var sessionId = req.header('sessionId');
  var attendanceTime = 0;

  if(studentId && classId && sessionId){
    connection.query('INSERT INTO attendance_tbl value(?,?,?,?)',[sessionId,classId,studentId,attendanceTime],(error,results,field)=>{
      if (error) {
        console.error(error);
        res.status(404).send(error);
      }
      else{
        res.status(200).send('data saved')
      }
    });
  }
  else{
    res.status(404).send('cant find data');
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

app.disable('etag');

module.exports = app;


// **admin app:

var app_admin = express();

// view engine setup
app_admin.set('views', path.join(__dirname, 'views'));
app_admin.set('view engine', 'jade');

app_admin.use(logger('dev'));
app_admin.use(express.json());
app_admin.use(express.urlencoded({ extended: false }));
app_admin.use(cookieParser());
app_admin.use(express.static(path.join(__dirname, 'public','web_app')));

app_admin.listen(3002, ()=>{
  console.log("port 3002 started");
});

app_admin.get('/', function(req, res, next) {
  res.sendFile(path.join(__dirname,'/public/web_app','admin_adjust_student_info.html'));
});

app_admin.get('/getStudent',function(req,res,next){
  var studentId = req.header('studentId');
  if(studentId){
    console.log('get student message received');
    console.log('studentId '+studentId);
    connection.query('SELECT student_name,student_sex,student_birthday,student_mail,student_tel,student_major,student_fpLink FROM student_tbl WHERE student_id = ?',[studentId],(error,results,field)=>{
      if(error){
        console.error(error);
      }
      else{
        if(results.length > 0) {
          var text = JSON.stringify(results);
          res.status(200).send(text);
        }
        else {
          res.status(404).send('cant find data');
        }
      }
    });
  }
  else{
    res.status(404).send('cant find student id');
  }
});

app_admin.post('/saveStudentInfo',(req,res)=>{
  var student = JSON.parse(req.header('studentInfo'));
  if(student){
    console.log('save student message received');
    console.log('student id: ' + student.student_id);
    connection.query('UPDATE student_tbl SET student_name = ?,student_sex = ?, student_birthday = ?, student_mail = ?, student_tel = ?, student_major = ? WHERE student_id = ?'
    ,[student.student_name,student.student_sex,student.student_birthday,student.student_mail,student.student_tel,student.student_major,student.student_id],(error,results,field)=>{
        if(error){
          console.error(error);
          console.log('test');
          res.status(404).send('cant find data');
        }
        else{
          res.status(200).send('save data success');
        }
    });
  }
  else{
    res.status(404).send('cant find data');
  }
});

app_admin.get('/getMachine',(req,res)=>{
  var roomId = req.header('roomId');
  if(roomId){
    console.log('get machine message received');
    console.log('roomId ' + roomId);
    connection.query('SELECT machine_id FROM room_tbl WHERE room_id = ?',[roomId],(error,results,field)=>{
        if(error){
          console.error(error);
          res.status(404).send('cant find data');
        }
        else{
          if(results.length > 0 ){
            var text = JSON.stringify(results);
            res.status(200).send(text);
          }
          else{
           res.status(404).send('cant find data');
          }
        }
    });
  }
  else{
    res.status(404).send('cant find data');
  }
});

app_admin.get('/getAllMachine',(req,res)=>{
  console.log('get all machine message received');
  connection.query('SELECT machine_id FROM machine_tbl',(error,results,field)=>{
    if(error){
      console.error(error);
      res.status(404).send('cant find data');
    }
    else{
      if(results.length > 0){
        var text = JSON.stringify(results);
        res.status(200).send(text);
      }
      else{
        res.status(404).send('cant find data');
      }
    }
  });
});

app_admin.post('/saveMachineRoom',(req,res)=>{
  var roomId = req.header('roomId');
  var machineId = req.header('machineId');
  if(roomId && machineId){
    console.log('save machine room message received');
    console.log('room Id: ' + roomId);
    console.log('machine Id: ' +machineId);
    
    connection.query('UPDATE room_tbl SET machine_id = ? WHERE room_id = ?',[machineId,roomId],(error,results,field)=>{
      if(error){
        console.error(error);
        res.status(404).send('cant find data');
      }
      else{
        connection.query('UPDATE room_tbl SET machine_id = \'notAssign\' WHERE machine_id = ? AND room_id <> ?',[machineId,roomId],(error,results,field)=>{
          if(error){
            console.error(error);
            res.status(404).send('cant find data');
          }
          else{
            res.status(200).send('change data success');
          }
        });
      }
    });
  }
  else{
    res.status(404).send('cant find data');
  }

});

app_admin.get('/getMachineIp',(req,res)=>{
  var machineId = req.header('machineId');
  if(machineId){
    console.log('get machine ip received');
    console.log('machineId: ' + machineId);

    connection.query('SELECT machine_ip from machine_tbl where machine_id = ?',[machineId],(error,results,fields)=>{
        if(error){
          console.error(error);
          res.status(404).send('database error');
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
    res.status(404).send('cant find machine Id')
  }
});

app_admin.post('/changeMachineIp',(req,res)=>{
  var machineId = req.header('machineId');
  var machineIp = req.header('machineIp');
  if(machineId && machineIp){
    console.log('change machine ip message received');
    console.log('machineId: ' + machineId);
    console.log('machineIp: ' + machineIp);

    connection.query('UPDATE machine_tbl SET machine_ip = ? WHERE machine_id = ?',[machineIp,machineId],(error,results,field)=>{
        if(error){
          console.error(error);
          res.status(404).send('database error');
        } 
        else{
          res.status(200).send('save success')
        }
    });
  }
  else{
    res.status(404).send('cant receive message')
  }
});

app_admin.get('/getClassStudent',(req,res)=>{
  var classId = req.header('classId');
  if(classId){
    console.log('get class student message received');
    console.log('classId: ' + classId);
    connection.query('SELECT student_tbl.student_id, student_tbl.student_name FROM class_detail_tbl inner join student_tbl on student_tbl.student_id = class_detail_tbl.student_id WHERE class_id = ?',[classId],(error,results,fields)=>{
        if(error){
          console.error(error);
          res.status(404).send(error);
        }
        else if(results.length > 0){
          var text = JSON.stringify(results);
          res.status(200).send(text);
        }
        else{
          res.status(404).send('cant find data in database');
        }
    });

  }
  else{
    res.status(404).send('cant find data');
  }
});

app_admin.post('/addStudentToClass',(req,res)=>{
  var classId = req.header('classId');
  var studentId = req.header('studentId');
  if(classId && studentId){
    console.log('add student to class message received');
    console.log('student id: ' + studentId);
    console.log('class id: ' + classId);

    connection.query('INSERT INTO class_detail_tbl VALUES (?,?)',[classId,studentId],(error,results,fields)=>{
      if(error){
        console.error(error);
        res.status(404).send(error);
      }
      else{
        res.status(200).send('save success');
      }
    });
  }
  else{
    res.status(404).send('cant find data');
  }
});

app_admin.post('/deleteStudentFromClass',(req,res)=>{
  var classId = req.header('classId');
  var studentId = req.header('studentId');
  if(classId && studentId){
    console.log('delete student from class message received');
    console.log('student id:' + studentId);
    console.log('class id: ' +classId);

    connection.query('DELETE FROM class_detail_tbl where student_id = ? AND class_id = ?',[studentId,classId],(error,results,fields)=>{
        if(error){
          console.error(error);
          res.status(404).send(error);
        }
        else{
          res.status(200).send('delete success');
        }
    });
  }
});

app_admin.post('/addSession',(req,res)=>{
  var classId = req.header('classId');
  var sessionId = parseInt(req.header('sessionId'));
  var sessionDate = req.header('sessionDate');
  var sessionRoom = req.header('sessionRoom');
  var sessionTime = req.header('sessionTime');
  if (classId && sessionId && sessionDate && sessionRoom && sessionTime){
    console.log('add session message received');
    console.log('classId: ' + classId);
    console.log('sessionId: ' + sessionId);
    console.log('sessionDate: ' + sessionDate);
    console.log('sessionRoom: ' + sessionRoom);
    console.log('sessionTime: ' + sessionTime);

    connection.query('INSERT INTO session_tbl VALUES(?,?,?,?,?)',[sessionId,sessionDate,sessionRoom,classId,sessionTime],(error,result,fields)=>{
        if(error){
          console.error(error);
          res.status(404).send(error);
        }
        else{
          var dir = 'attendanceImage/' + classId + '/' +sessionId;
          fs.mkdir(path.join(__dirname,dir),(error)=>{
            if(error){
              console.error(error);
            }
            else{
              res.status(200).send('add success');
            }
          })
        }
    });

  }
  else{
    res.status(404).send('cant find data')
  }
});