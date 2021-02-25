var express = require('express');
var mysql = require('./dbcon.js');
var CORS = require('cors')

var app = express();
app.set('port', 5249);
app.use(express.json())
app.use(express.urlencoded({extended: false}))
app.use(CORS());
app.use(express.static('public'));

// Book page queries 
const getAllQuery = 'SELECT * FROM books';  // gets all the rows from the database
const getTitle = 'SELECT * FROM books WHERE title=?';
const getISBN = 'SELECT * FROM books WHERE isbn=?';
const getAuthLastName = 'SELECT * FROM books JOIN authors ON books.auth_id = authors.auth_id AND authors.auth_last_name=?'; 
const getYear = 'SELECT * FROM books WHERE year=?';
const getAllFields = 'SELECT * FROM books JOIN authors ON books.auth_id = authors.auth_id WHERE title=? AND isbn=? AND authors.auth_last_name = ? AND year=?';
const insertQuery = "INSERT INTO books (`isbn`, `title`, `auth_id`, `year`, `copies_available`) VALUES (?, ?, ?, ?, ?)";  // insert row in the database
const updateQuery = "UPDATE books SET isbn=?, title=?, auth_id=?, year=?, copies_available=? WHERE id=? ";  // updates row in the database
const getTitleLastName = 'SELECT * FROM books JOIN authors ON books.auth_id = authors.auth_id WHERE title=? AND authors.auth_last_name = ?';
const getTitleLastNameYear = 'SELECT * FROM books JOIN authors ON books.auth_id = authors.auth_id WHERE title=? AND authors.auth_last_name = ? AND year=?';
const getTitleYear = 'SELECT * FROM books JOIN authors ON books.auth_id = authors.auth_id WHERE title=? AND year=?';
const getLastNameYear = 'SELECT * FROM books JOIN authors ON books.auth_id = authors.auth_id WHERE authors.auth_last_name = ? AND year=?';

// Authors page queries
const getAllQueryAuth = 'SELECT * FROM authors';
const insertQueryAuth = "INSERT INTO authors (`auth_first_name`, `auth_mid_name`, `auth_last_name`) VALUES (?, ?, ?)"; 
const getAuthorID = "SELECT * FROM authors WHERE auth_id =?";
const getAuthorFirstName = "SELECT * FROM authors WHERE auth_first_name=?";
const getAuthorLastName = "SELECT * FROM authors WHERE auth_last_name=?";
const getAuthorFirstLastName = "SELECT * FROM authors  WHERE auth_first_name =? AND auth_last_name =?";


// Members page queries
const getAllMembers = 'SELECT * FROM members' ;
const insertMemberQuery = "INSERT INTO members (`mem_first_name`, `mem_mid_name`, `mem_last_name`, `mem_email`, `mem_zip_code`, `books_checked_out`) VALUES (?, ?, ?, ?, ?,?)";
const deleteMemQuery = "DELETE FROM members WHERE mem_id=?";


// Member Account page queries
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
const insertLoanQuery =   `INSERT INTO loans (mem_id, loan_date, loan_due_date)
                          VALUES (?, ?, ?);`
const insertBookResQuery = `INSERT INTO book_reservation (res_id, book_id)
                            VALUES (?,?);`
const insertResQuery = `INSERT INTO reservations (mem_id, res_date, res_active)
                        VALUES (?, ?, ?);`

// sends the entire table/data back to the client
const getAllData = (res) => {
  mysql.pool.query(getAllQuery, (err, rows, field) => {
    if(err){
      next(err);
      return;
    }
    res.json({'rows':rows});
  });
};

// functions for MEMBERS
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

// functions for MEMBERACCOUNT
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

// GET route for BOOKS
app.get('/books',function(req,res,next){
  var context = {};
  // all fields were selected.
  if (req.query.title && req.query.isbn && req.query.last_name && req.query.year){
    mysql.pool.query(getAllFields, [req.query.title, req.query.isbn, req.query.last_name, req.query.year], function(err, rows, fields){
      if(err){
        next(err);
        return;
      }
      context.results = JSON.stringify(rows);
      res.send(context);
    });

    // book title, author last name, year selected
  } else if (req.query.title && req.query.last_name && req.query.year){
    mysql.pool.query(getTitleLastNameYear, [req.query.title, req.query.last_name, req.query.year], function(err, rows, fields){
      if(err){
        next(err);
        return;
      }
      context.results = JSON.stringify(rows);
      res.send(context);
    });

  // book title and author last name field selected
  } else if (req.query.title && req.query.last_name){
    mysql.pool.query(getTitleLastName, [req.query.title, req.query.last_name], function(err, rows, fields){
      if(err){
        next(err);
        return;
      }
      context.results = JSON.stringify(rows);
      res.send(context);
    }); 

    // book title and year selected
  } else if (req.query.title && req.query.year){
    mysql.pool.query(getTitleYear, [req.query.title, req.query.year], function(err, rows, fields){
      if(err){
        next(err);
        return;
      }
      context.results = JSON.stringify(rows);
      res.send(context);
    });

    // book author last name and year selected
  } else if (req.query.last_name && req.query.year){
    mysql.pool.query(getLastNameYear, [req.query.last_name, req.query.year], function(err, rows, fields){
      if(err){
        next(err);
        return;
      }
      context.results = JSON.stringify(rows);
      res.send(context);
    });

   // book title selected
  }else if (req.query.title) {
    mysql.pool.query(getTitle, [req.query.title], function(err, rows, fields){
      if(err){
        next(err);
        return;
      }
      context.results = JSON.stringify(rows);
      res.send(context);
    });

    // book isbn selected
  } else if (req.query.isbn) {
    mysql.pool.query(getISBN, [req.query.isbn], function(err, rows, fields){
      if(err){
        next(err);
        return;
      }
      context.results = JSON.stringify(rows);
      res.send(context);
    });

    // book author last name selected.
  } else if (req.query.last_name) {
    mysql.pool.query(getAuthLastName, [req.query.last_name], function(err, rows, fields){
      if(err){
        next(err);
        return;
      }
      context.results = JSON.stringify(rows);
      res.send(context);
    });

    // book year selected
  } else if (req.query.year){
    mysql.pool.query(getYear, [req.query.year], function(err, rows, fields){
      if(err){
        next(err);
        return;
      }
      context.results = JSON.stringify(rows);
      res.send(context);
    });

    // no fields were selected, show all data
  } else {
    mysql.pool.query(getAllQuery, function(err, rows, fields){
      if(err){
        next(err);
        return;
      }
      context.results = JSON.stringify(rows);
      res.send(context);
    });
  }
});


// GET route for AUTHORS
app.get('/authors',function(req,res,next){
  var context = {};
  // first and last name selected
  if (req.query.first_name && req.query.author_last_name){
    mysql.pool.query(getAuthorFirstLastName, [req.query.first_name, req.query.author_last_name], function(err, rows, fields){
      if(err){
        next(err);
        return;
      }
      context.results = JSON.stringify(rows);
      res.send(context);
    });
    
  // author id selected
  } else if (req.query.auth_id) {
    mysql.pool.query(getAuthorID, [req.query.auth_id], function(err, rows, fields){
      if(err){
        next(err);
        return;
      }
      context.results = JSON.stringify(rows);
      res.send(context);
    });

  // author first name selected
  } else if (req.query.first_name) {
    mysql.pool.query(getAuthorFirstName, [req.query.first_name], function(err, rows, fields){
      if(err){
        next(err);
        return;
      }
      context.results = JSON.stringify(rows);
      res.send(context);
    });

  // author last name selected
  } else if (req.query.author_last_name) {
    mysql.pool.query(getAuthorLastName, [req.query.author_last_name], function(err, rows, fields){
      if(err){
        next(err);
        return;
      }
      context.results = JSON.stringify(rows);
      res.send(context);
    });

  // no fields were selected, show all data
  } else {
    mysql.pool.query(getAllQueryAuth, function(err, rows, fields){
      if(err){
        next(err);
        return;
      }
      context.results = JSON.stringify(rows);
      res.send(context);
    });
  }
});


//  POST route for BOOKS
app.post('/books',function(req,res,next){
  var context = {};
  var {isbn, title, auth_id, year, copies_available} = req.body;   
  mysql.pool.query( insertQuery, [isbn, title, auth_id, year, copies_available], function(err, result){
    if(err){
      next(err);
      return;
    }
    getAllData(res);
  });
});


// POST route for AUTHORS
app.post('/authors',function(req,res,next){
  var context = {};
  console.log(req.body)
  var {auth_first_name, auth_mid_name, auth_last_name} = req.body;   
  mysql.pool.query( insertQueryAuth, [auth_first_name, auth_mid_name, auth_last_name], function(err, result){
    if(err){
      next(err);
      return;
    }
    getAllData(res);
  });
});

// GET MEMBERS
app.get('/members',function(req,res,next){
  if (Object.keys(req.query).length !== 0) {
    // console.log(req.query)
    getMemSearchResults(req,res);
  } else {
    // console.log(req.query)
    getMemAllData(res);
  }
});

// POST MEMBERS
app.post('/members',function(req,res,next){
var {mem_first_name, mem_mid_name, mem_last_name, mem_email, mem_zip_code, books_checked_out, mem_id} = req.body;
mysql.pool.query(insertMemberQuery, [mem_first_name, mem_mid_name, mem_last_name, mem_email, mem_zip_code, books_checked_out, mem_id], (err, result) => {
  if(err){
    next(err);
    return;
  }
  // console.log(result)
  getMemAllData(res);
});
});

// DELETE MEMBERS
app.delete('/members',function(req,res,next){
var mem_id = req.body.id;
mysql.pool.query(deleteMemQuery, mem_id, (err, result) => {
  if(err){
    next(err);
    return;
  }
  getMemAllData(res);
});
});

// GET LOAN and RESERVATIONS
app.get('/memberAccount',function(req,res,next){
  let mem_id = req.query.mem_id;
  getMemLoans(req.query.mem_id,res);
});


// POST LOAN
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

      mysql.pool.query('UPDATE members SET books_checked_out = books_checked_out + 1 WHERE mem_id= ?', mem_id, (err, result) => {
        if(err){
          next(err);
          return;
        }})

        getMemLoans(mem_id,res);
    });
  });
});


// POST RESERVATION
app.post('/memberAccountres',function(req,res,next){
  var {book_id, mem_id, res_id} = req.body;
  var res_date = new Date().toISOString().slice(0, 19).replace('T', ' ');
  var res_active = true;
  mysql.pool.query(insertResQuery, [mem_id, res_date, res_active, res_id], (err, result) => {
    if(err){
      next(err);
      return;
    }

    mysql.pool.query(insertBookResQuery, [String(result.insertId), book_id], (err, result1) => {
      if(err){
        next(err);
        return;
      }

      getMemLoans(mem_id,res);
    });
  });
});


// deletes table-row in database.
app.delete('/',function(req,res,next){
  var {id} = req.body;
  mysql.pool.query(deleteQuery, [id], function(err, result){
    if(err){
      next(err);
      return;
    }
    getAllData(res);
  });
});

// updates database.
app.put('/',function(req,res,next){
  var context = {};
  var {name, reps, weight, unit, date, id} = req.body
  mysql.pool.query(updateQuery,[name, reps, weight, unit, date, id], function(err, result){
    if(err){
      next(err);
      return;
    }
    getAllData(res);
  });
});


app.use(function(req,res){
  res.status(404);
  res.send('404');
});

app.use(function(err, req, res, next){
  console.error(err.stack);
  res.status(500);
  res.send('500');
});


app.listen(app.get('port'), function(){
  console.log(`Express started on http://${process.env.HOSTNAME}:${app.get('port')}; press Ctrl-C to terminate.`);
});