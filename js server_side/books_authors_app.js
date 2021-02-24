var express = require('express');
var mysql = require('./dbcon.js');
var CORS = require('cors')

var app = express();
app.set('port', 3103);
app.use(express.json())
app.use(express.urlencoded({extended: false}))
app.use(CORS());

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