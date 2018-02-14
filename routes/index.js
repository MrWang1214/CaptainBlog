var express = require('express');
var moment = require('moment');
var router = express.Router();
var mysql = require('mysql');
var path = require('path');
var bodyParser = require('body-parser');
//var query = require("mysql.js");
var pool = mysql.createPool({
  connectionLimit: 10,
  host: 'localhost',
  user: 'root',
  password: 'wtc19940712',
  port: '3306',
  database: 'shuApp',
  multipleStatements: true,//启用多条查询语句
  dateStrings: true
});
// 创建 application/x-www-form-urlencoded 编码解析
var urlencodedParser = bodyParser.urlencoded({ extended: false })
/* GET home page. */
router.get('/', function (req, res, next) {
  pool.getConnection(function (err, connection) {
    // Use the connection
    var sqlArticle = 'select * from article order by article_id desc limit 10;';
    var sqlDatetime = 'SELECT DISTINCT extract(year from article_time) as updataTime FROM article;';
    var sqlCategory = 'SELECT DISTINCT sort_article_id FROM article;';
    var sqlRecent = 'select * from article order by article_id desc limit 4;';
    var sql = sqlArticle + sqlDatetime + sqlCategory + sqlRecent;
    connection.query(sql, function (err, rs) {
      if (err) {
        console.log(err);
      } else {
        res.render('index', { article: rs[0], datetime: rs[1], category: rs[2], recent: rs[3] });
      }
      // And done with the connection.  
      connection.release();
      // Don't use the connection here, it has been returned to the pool.
    });
  });
});
//User Login
router.post('/login', urlencodedParser, function (req, res) {
  var user_name = req.body.user_name;
  var password = req.body.password;
  var data = {};
  pool.getConnection(function (err, connection) {
    // Use the connection
    connection.query('select * from users where user_name = "' + user_name + '";', function (err, rs) {
      if (rs[0] == null) {
        data.message = "User not exist";
        console.log(new Date() + data.message);
      } else {
        if (rs[0].user_pass == password) {
          data.message = "Login success";
          console.log(new Date() + " " + user_name + " " + data.message);
          res.sendFile(path.resolve(__dirname, '..') + "/" + "public" + "/" + "updata.html");
        } else {
          data.message = "Password err";
          console.log(new Date() + data.message);
        }
      }
      // And done with the connection.
      connection.release();
      // Don't use the connection here, it has been returned to the pool.
    });
  });
});
//Article Updata 
router.post('/updata', urlencodedParser, function (req, res) {
  var article_name = req.body.article_name;
  var sort_article_id = req.body.sort_article_id;
  var article_content = req.body.article_content;
  //var myDate = moment(new Date()).format('YYYY-MM-DD');
  //console.log(myDate);
  //var article_time = myDate.toLocaleString();
  var article_time = new Date();
  var data = {};
  pool.getConnection(function (err, connection) {
    // Use the connection
    var addSql = 'insert into article(article_id,article_name,article_time,sort_article_id,article_content) values(0,?,?,?,?);';
    var addSqlParams = [article_name, article_time, sort_article_id, article_content];
    connection.query(addSql, addSqlParams, function (err, rs) {
      if (err) {
        console.log(err);
      } else {
        res.redirect('/');
        return;
      }
      // And done with the connection.
      connection.release();
      // Don't use the connection here, it has been returned to the pool.
    });
  });
});
//article details
router.get('/articles/:article_id', urlencodedParser, function (req, res) {
  var article_id = req.params.article_id;
  var query = 'select * from article where article_id=' + mysql.escape(article_id);
  pool.getConnection(function (err, connection) {
    // Use the connection
    connection.query(query, function (err, rs) {
      if (err) {
        console.log(err);
        return;
      } else {
        var article = rs[0];
        res.render('article', { article: article });
      }
      // And done with the connection.
      connection.release();
      // Don't use the connection here, it has been returned to the pool.
    });
  });
});
//achieve list
router.get('/articles/achieve/:updataTime', urlencodedParser, function (req, res) {
  var updataTime = req.params.updataTime;
  var query = 'SELECT * FROM article WHERE article_time like "%' + updataTime + '%";'
  pool.getConnection(function (err, connection) {
    // Use the connection
    connection.query(query, function (err, rs) {
      if (err) {
        console.log(err);
        return;
      } else {
        var article = rs;
        res.render('achieve', { article: article });
      }
      // And done with the connection.
      connection.release();
      // Don't use the connection here, it has been returned to the pool.
    });
  });
});
//sort list
router.get('/articles/sort/:sort_article_id', urlencodedParser, function (req, res) {
  var sort_article_id = req.params.sort_article_id;
  var query = 'SELECT * FROM article WHERE sort_article_id like "%' + sort_article_id + '%";'
  pool.getConnection(function (err, connection) {
    // Use the connection
    connection.query(query, function (err, rs) {
      if (err) {
        console.log(err);
        return;
      } else {
        var article = rs;
        res.render('achieve', { article: article });
      }
      // And done with the connection.
      connection.release();
      // Don't use the connection here, it has been returned to the pool.
    });
  });
});
//recent post
router.get('/articles/recent/:article_name', urlencodedParser, function (req, res) {
  var article_name = req.params.article_name;
  var query = 'SELECT * FROM article WHERE article_name =" '+ article_name +' ";'
  pool.getConnection(function (err, connection) {
    // Use the connection
    connection.query(query, function (err, rs) {
      if (err) {
        console.log(err);
        return;
      } else {
        var article = rs;
        res.render('article', { article: article });
      }
      // And done with the connection.
      connection.release();
      // Don't use the connection here, it has been returned to the pool.
    });
  });
});
module.exports = router;
