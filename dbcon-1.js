var mysql = require('mysql');
var pool = mysql.createPool({
  connectionLimit : 10,
  host            : 'classmysql.engr.oregonstate.edu',
  user            : 'cs340_klemzcea',
  password        : '7032',
  database        : 'cs340_klemzcea'
});

module.exports.pool = pool;
