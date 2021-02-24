var express = require('express');
var mysql = require('./dbcon.js');
var CORS = require("cors")

var app = express();
app.set('port', 5249);
app.use(express.json())
app.use(express.urlencoded({extended: false}));
app.use(CORS());

const getAllMembers = 'SELECT * FROM members' ;
const insertMemberQuery = "INSERT INTO members (`mem_first_name`, `mem_mid_name`, `mem_last_name`, `mem_email`, `mem_zip_code`, `books_checked_out`) VALUES (?, ?, ?, ?, ?,?)";
const getAllLoans = `SELECT title, auth_first_name, auth_last_name, loans.loan_id, loan_date, loan_due_date 
                    FROM members 
                    JOIN loans ON members.mem_id = loans.mem_id
                    JOIN book_loan ON loans.loan_id = book_loan.loan_id
                    JOIN books ON book_loan.book_id = books.book_id
                    JOIN authors ON books.auth_id = authors.auth_id
                    AND members.mem_id = ?;`
const getAllRes = `SELECT title, auth_first_name, auth_last_name, res_date, res_active
                  FROM members 
                  JOIN reservations ON members.mem_id = reservations.mem_id
                  JOIN book_reservation ON reservations.res_id = book_reservation.res_id
                  JOIN books ON book_reservation.book_id = books.book_id
                  JOIN authors ON books.auth_id = authors.auth_id
                  AND members.mem_id = ?;`

const insertBookLoanQuery = `INSERT INTO book_loan (loan_id, book_id)
                            VALUES (?,?);`

const insertLoanQuery = `INSERT INTO loans (mem_id, loan_date, loan_due_date)
                        VALUES (?, ?, ?);`

const insertBookLoanQuery = `INSERT INTO book_loan (loan_id, book_id)
                            VALUES (?,?);`

const insertLoanQuery = `INSERT INTO loans (mem_id, loan_date, loan_due_date)
                    VALUES (?, ?, ?);`


// const updateQuery = "UPDATE workout SET name=?, reps=?, weight=?, unit=?, date=? WHERE id=? " ;
// const deleteQuery = "DELETE FROM workout WHERE id=?";
// const dropTable = "DROP TABLE IF EXISTS workout";
// const makeTableQuery = `CREATE TABLE workout(
//                         id INT PRIMARY KEY AUTO_INCREMENT,
//                         name VARCHAR(255) NOT NULL,
//                         reps INT,
//                         weight INT,
//                         unit BOOLEAN,
//                         date DATE);`;

// Unit of 0 is lbs, unit of 1 is kgs

const getMemAllData = (res) => {
  mysql.pool.query(getAllMembers, (err, rows, fields) => {
    if (err) {
      next(err);
      return;
    }
    // console.log(rows[0])
    res.json({'rows': rows });
  })
}

const getMemSearchResults = (req, res) => {
  if (req.query.nameSearch !== "" && req.query.zipSearch !== "") {
    mysql.pool.query('SELECT * FROM members WHERE mem_last_name = ? AND mem_zip_code = ?', [req.query.nameSearch,req.query.zipSearch], (err, rows, fields) => {
      if (err) {
        next(err);
        return;
      }
      res.json({'rows': rows });
    })
  } else if (req.query.nameSearch !== "") {
    mysql.pool.query('SELECT * FROM members WHERE mem_last_name =?', req.query.nameSearch, (err, rows, fields) => {
      if (err) {
        next(err);
        return;
      }
      res.json({'rows': rows });
    })
  } else if (req.query.zipSearch !== "") {
    mysql.pool.query('SELECT * FROM members WHERE mem_zip_code =?', req.query.zipSearch, (err, rows, fields) => {
      if (err) {
        next(err);
        return;
      }
      res.json({'rows': rows });
    })
  } else {
    getMemAllData(res);
  }
 
}

// Get members
app.get('/members',function(req,res,next){
    if (Object.keys(req.query).length !== 0) {
      // console.log(req.query)
      getMemSearchResults(req,res);
    } else {
      // console.log(req.query)
      getMemAllData(res);
    }
  });

// insert members
app.post('/members',function(req,res,next){
  var {mem_first_name, mem_mid_name, mem_last_name, mem_email, mem_zip_code, books_checked_out, mem_id} = req.body;
  mysql.pool.query(insertMemberQuery, [mem_first_name, mem_mid_name, mem_last_name, mem_email, mem_zip_code, books_checked_out, mem_id], (err, result) => {
    if(err){
      next(err);
      return;
    }
    console.log(result)
    getMemAllData(res);
  });
});

// app.delete('/',function(req,res,next){
//   var id = req.body.id;
//   mysql.pool.query(deleteQuery, id, (err, result) => {
//     if(err){
//       next(err);
//       return;
//     }
//     getMemAllData(res);
//   });
// });


///member-update
// app.put('/members',function(req,res,next){
//   var { name, reps, weight, unit, date, id } = req.body;
//   mysql.pool.query(updateQuery,
//     [name, reps, weight, unit, date, id],
//     (err, result) => {
//     if(err){
//       next(err);
//       return;
//     }
//     getMemAllData(res);
//   });
// });

// Members

let memLoanRes = {}
const getMemLoans = (req, res) => {
  mysql.pool.query(getAllLoans, req, (err, rows, fields) => {
    if (err) {
      console.log('get mems loan')
      next(err);
      return;
    }
    memLoanRes.loans = rows
    // console.log(memLoanRes.loans)
    getMemRes(req,res)
  })
}

const getMemRes = (req, res) => {
  mysql.pool.query(getAllRes, req, (err, rows, fields) => {
    if (err) {
      next(err)
      return;
    }
    memLoanRes.reserv = rows;
    res.json({'loans': memLoanRes.loans,'reserv': memLoanRes.reserv});
  })
}

// display loans and reservations
app.get('/memberAccount',function(req,res,next){
  let mem_id = req.query.mem_id;
  console.log("mem id ", mem_id)
  getMemLoans(req.query.mem_id,res);
});

// insert loan
app.post('/memberAccount',function(req,res,next){
  var {book_id, mem_id, loan_id} = req.body;
  var loan_date = new Date().toISOString().slice(0, 19).replace('T', ' ');
  var loan_due_date = loan_date;
  mysql.pool.query(insertLoanQuery, [mem_id, loan_date, loan_due_date, loan_id], (err, result) => {
    if(err){
      next(err);
      return;
    }

    mysql.pool.query(insertBookLoanQuery, [String(result.insertId), book_id], (err, result1) => {
      if(err){
        next(err);
        return;
      }

      getMemLoans(mem_id,res);
    });
  });
});

// app.delete('/',function(req,res,next){
//   var id = req.body.id;
//   mysql.pool.query(deleteQuery, id, (err, result) => {
//     if(err){
//       next(err);
//       return;
//     }
//     getMemAllData(res);
//   });
// });


// app.get('/reset-table',function(req,res,next){
//   var context = {};
//   mysql.pool.query(dropTable, function(err){
//     mysql.pool.query(makeTableQuery, function(err){
//       context.results = "Table reset";
//       res.send(context);
//     })
//   });
// });

app.use(function(req,res){
  res.status(404);
  res.render('404');
});

app.use(function(err, req, res, next){
  console.error(err.stack);
  res.status(500);
  res.render('500');
});

app.listen(app.get('port'), function(){
  console.log(`Express started on http://${process.env.HOSTNAME}:${app.get('port')}; press Ctrl-C to terminate.`);
});
