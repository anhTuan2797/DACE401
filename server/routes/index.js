var express = require('express');
var path = require('../app');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  // res.sendFile('main_page.html',{root: __dirname});
  res.sendFile(path.join(__dirname,'/public/web_app','login_page.html'));
});

module.exports = router;
