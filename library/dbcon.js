var mysql = require('mysql');
var pool = mysql.createPool({
  connectionLimit : 10,
  host            : 'classmysql.engr.oregonstate.edu',
  user            : 'cs340_phungvi',
  password        : '6yIXY611GtOWMDaM',
  database        : 'cs340_phungvi'
});

module.exports.pool = pool;
