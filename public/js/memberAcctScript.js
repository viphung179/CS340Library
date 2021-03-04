const baseUrl = `http://flip3.engr.oregonstate.edu:5149/memberAccount`;
const extraUrl = 'http://flip3.engr.oregonstate.edu:5149/books';

let currMemId = localStorage['mem_id'];
let currMemName = localStorage['mem_fname'] + ' ' + localStorage['mem_lname'];
let currBooks = localStorage['books_checked']

let userID = document.createElement('h4');
userID.textContent = 'Member ID: ' + currMemId;
userID.classList.add('lead', 'pl-3');
document.body.appendChild(userID);

let userName = document.createElement('h4');
userName.textContent = 'Member Name: ' + currMemName;
userName.classList.add('lead', 'pl-3');
document.body.appendChild(userName);

let booksDes = document.createElement('p');
booksDes.textContent = 'Books Checked Out: ';
booksDes.classList.add('lead', 'pl-3');
booksDes.id = 'booksDes'
document.body.appendChild(booksDes)

let currLoans = null;

document.addEventListener('DOMContentLoaded', getdata);

// make a book loan
document.getElementById('loanBook').addEventListener('click', function(event){
    let req = new XMLHttpRequest();
    let books= document.getElementById('books').textContent
    let info = {book_id: null, mem_id: currMemId};
    info.book_id = document.getElementById('BookId').value;
    console.log(info.book_id)
    req.open('POST', baseUrl, true);
    req.setRequestHeader('Content-Type', 'application/json');
    
    req.addEventListener('load',function(){
      if(req.status >= 200 && req.status < 400){
        let response = JSON.parse(req.responseText);
        document.getElementById("message").textContent = "Book Loan Successful"  // displays badge
        deleteTable()
        currLoans = response["loans"]
        makeBooksCheckedOut(response["loans"])
        if (response["loans"].length != 0){
          makeTable(response["loans"]);
        }
      } else {
        console.log("Error in network request: " + req.statusText);
      }});
    
     if(info.book_id !== '') {
       if (books >= 5) {
         alert("The max amount of books currently checked out has been reached.")
       } else {
         if (isDups(currLoans, info.book_id) === true) {
           alert("This book is in your current loans list.")
         } else {
           req.send(JSON.stringify(info));
          }
        }
      }
    event.preventDefault();
  });

// get member's loans
function getdata() {
  let req = new XMLHttpRequest();
  req.open('GET', baseUrl + "?mem_id=" + currMemId, true);
  req.addEventListener('load',function(){
      if (req.status >= 200 && req.status < 400){
        let response = JSON.parse(req.responseText);
        currLoans = response["loans"];
        makeBooksCheckedOut(response["loans"])
        if (response["loans"].length != 0){
          makeTable(response["loans"]);
        }
      } else {
        console.log('Error in network request: ' + req.statusText);
      }
  })
  req.send(null);
  
}

// calculate books checked out
function getBooksCheckedOut(loans) {
  let booksCheckedOut = 0
  if (loans.length == 0) {
    return booksCheckedOut
  }
  for (let i = 0; i < loans.length; i++) {
    if (loans[i].loan_status == 1){
      booksCheckedOut += 1
    }
  }
  return booksCheckedOut
}

// create books checked out row on page
function makeBooksCheckedOut(rows){
  let userBooks = document.createElement('span');
  userBooks.textContent = getBooksCheckedOut(rows);
  userBooks.id = 'books'
  userBooks.classList.add('lead', 'pl-3');
  
  booksDes.appendChild(userBooks);
}

// create loans table
function makeTable(rows) {
  let newTable = document.createElement("table");
  newTable.id = 'loanTable';
  newTable.classList.add('container', 'mb-5');
  let newCardHeader = document.createElement("h5");
  newCardHeader.textContent = "Current and Past Loans";
  newCardHeader.classList.add('card-header', 'alert-info', 'text-center', 'mb-1');
  newCardHeader.id = 'loanHeader'
  document.body.appendChild(newCardHeader);
  document.body.appendChild(newTable);

  makeHeaders(newTable);

  makeRow(rows, newTable);

  newTable.addEventListener('click',function(event){
    let target = event.target;
    // console.log(target)
    let targetId = target.parentNode.parentNode.firstElementChild.textContent;
    // console.log('targetID', targetId)
    let targetStatus = document.getElementById("newStatus" + targetId).value
    // console.log("targetat",targetStatus.value)
    // console.log(targetId)
    if (target.tagName != 'BUTTON') return;
    if (target.textContent == "Delete"){
      deleteRow(targetId, targetStatus);
    } else if (target.textContent == "Update") {
      updateRow(target, targetId);
      // console.log(target.parentNode.textContent)
    } else {
      localStorage.setItem('objectToPass', targetId);
    }
  })
}

// create headers for loans table
function makeHeaders(newTable) {
  let header = document.createElement("thead");
  newTable.appendChild(header);
  let headerName = ['id','Title', 'Author', 'Loan Date', 'Status'];
    for (let c = 0; c < headerName.length; c++){
        let newHeader = document.createElement("th");
        newHeader.textContent = headerName[c];

        if (newHeader.textContent == "id") {
          newHeader.style.display = "none";
        }

        header.appendChild(newHeader);
    }
}

// create row for loan
function makeRow(rows, newTable){
  let body = document.createElement("tbody");
  newTable.appendChild(body);
  console.log(rows)
  for (let i = 0; i < rows.length; i++) {
    let newRow = document.createElement("tr");
    let loan_id = createTD("number", rows[i].loan_id, "loanId" + rows[i].loan_id, true);
    let book_id = createTD("number", rows[i].book_id, "bookId" + rows[i].loan_id, true)
    let title = createTD("text", rows[i].title, "title" + rows[i].loan_id)
    let author_name = createTD("text", rows[i].auth_first_name + " " + rows[i].auth_last_name, "authName" + rows[i].loan_id)
    let loan_date = createTD("date", rows[i].loan_date.slice(0,10), "loanDate"+ rows[i].loan_id)
    
    // create loan_status drop down
    let loan_status = document.createElement('td')
    var _form = loan_status.appendChild(document.createElement('form')),
    statusInput = _form.appendChild(document.createElement('input')),
    statusDatalist = _form.appendChild(document.createElement('datalist'));
    statusDatalist.id = 'statusList' + rows[i].loan_id;
    statusInput.id = "newStatus" + rows[i].loan_id
    statusInput.setAttribute('list','statusList' + rows[i].loan_id);
    statusInput.disabled = true;
    let active = document.createElement('option')
    active.value = 'Active'
    active.textContent = 'Active'
    let inactive = document.createElement('option')
    inactive.value = 'Inactive'
    inactive.textContent = "Inactive"
    statusDatalist.appendChild(active)
    statusDatalist.appendChild(inactive)
    
    newRow.appendChild(loan_id);
    newRow.appendChild(book_id);
    newRow.appendChild(title);
    newRow.appendChild(author_name);
    newRow.appendChild(loan_date);
    newRow.appendChild(loan_status);

    if (rows[i].loan_status == 0) {
      inactive.setAttribute("selected", "selected")
      statusInput.value = "Inactive"
    } else {
      active.setAttribute("selected", "selected")
      statusInput.value = "Active"
    }

    let updateCell = document.createElement("td");
    let updateButton = document.createElement("button");
    updateButton.textContent = "Update";
    updateButton.classList.add("btn","btn-info");
    updateCell.appendChild(updateButton);
    
    let deleteCell = document.createElement("td");
    let deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.classList.add("btn","btn-info");
    deleteCell.appendChild(deleteButton);

    newRow.appendChild(updateCell);
    newRow.appendChild(deleteCell);
    body.appendChild(newRow);
  }
}

// update loan
function updateRow(button, id) {
  let loanDateStatus = document.getElementById('loanDate'+id)
  let loanStatus = document.getElementById('newStatus' + id)
  let save_status = document.getElementById('newStatus' + id).value;

  if (save_status == "Inactive") {
    save_status = 0
  } else {
    save_status = 1
  }

  if (loanStatus.value == "Active"){
    let status = document.getElementById('newStatus' + id);
    status.value = ''
    loanDateStatus.disabled = false
    loanStatus.disabled = false
  } else {
    loanDateStatus.disabled = false
  }

  button.textContent = "Done";
  
  

  button.addEventListener('click', function(){
    let req = new XMLHttpRequest();
    let info = {loan_id: null, loan_date:null, loan_status:null, book_id: null, mem_id: null };
    info.loan_id = document.getElementById('loanId' + id).textContent;
    info.loan_status = document.getElementById('newStatus' + id).value;
    if (info.loan_status == 'Inactive') {
      info.loan_status = 0;
    } else if (info.loan_status == 'Active') {
      info.loan_status = 1;
    } else {
      info.loan_status = save_status
    }
    info.loan_date = new Date(document.getElementById('loanDate'+ id).value)
    info.book_id = document.getElementById('bookId' + id).textContent;
    info.mem_id = currMemId;
    req.open('PUT', baseUrl, true);
    req.setRequestHeader('Content-Type', 'application/json');
    req.addEventListener('load',function(){
      if(req.status >= 200 && req.status < 400){
        let response = JSON.parse(req.responseText);
        deleteTable();
        currLoans = response["loans"]
        makeBooksCheckedOut(response["loans"])
        if (response["loans"].length != 0){
          makeTable(response["loans"]);
        }
      } else {
        console.log("Error in network request: " + req.statusText);
      }});
    
    req.send(JSON.stringify(info));
  })
  
}

// delete loan
function deleteRow(rowID, rowStatus) {
  let req = new XMLHttpRequest();
  console.log("rowStatus", rowStatus)
  let info = {mem_id:currMemId, loan_id: rowID, loan_status: rowStatus, book_id:null};
  info.book_id = document.getElementById('bookId' + rowID).textContent;
  req.open('DELETE', baseUrl, true);
  req.setRequestHeader('Content-Type', 'application/json');
  req.addEventListener('load',function(){
    if(req.status >= 200 && req.status < 400){
      let response = JSON.parse(req.responseText);
      currLoans = response["loans"]
      deleteTable();
      makeBooksCheckedOut(response["loans"])
      if (response["loans"].length != 0){
        makeTable(response["loans"]);
      }
    } else {
      console.log("Error in network request: " + req.statusText);
    }});
  
  req.send(JSON.stringify(info));
}

// check if book is already in member's current loans
function isDups(membersLoans, book_id){
  console.log(membersLoans)
  for (let i = 0; i < membersLoans.length; i++) {
    if (membersLoans[i].book_id == book_id && membersLoans[i].loan_status == 1) {
      return true
    }
  }
  return false
}

function createTD(type, value, id, isID = false) {
  if (isID) {
    let fieldCell = document.createElement("td");
    fieldCell.textContent = value;
    fieldCell.id = id;
    fieldCell.style.display = "none";
    return fieldCell
  } else {  
    let fieldInput = document.createElement("INPUT");
    fieldInput.type = type;
    fieldInput.value = value;
    fieldInput.textContent = value;
    fieldInput.id = id;
    
    fieldCell = document.createElement("td");
    fieldCell.appendChild(fieldInput);

    if (type == "date") {
      fieldInput.value = value;
    }

    fieldInput.disabled = true;
    
    return fieldCell
  }
}

// delete loans table
function deleteTable(){
  let loantable = document.getElementById('loanTable');
  let loanheading = document.getElementById('loanHeader');
  let booksCount = document.getElementById('books')
  booksCount.parentNode.removeChild(booksCount);
  if (loantable !== null) {
    loantable.parentNode.removeChild(loantable);
    loanheading.parentNode.removeChild(loanheading);
    
  }
}

// populating drop down menu for book ID for loan book
document.getElementById('BookId').addEventListener('click', function(event){
  var req = new XMLHttpRequest();
  var select = document.getElementById('select')
  req.open('GET', extraUrl, true);
  req.send(null);
  req.addEventListener('load',function(){
      if(req.status >= 200 && req.status < 400){
          let response = JSON.parse(req.responseText);
          data = JSON.parse(response.results)
          for(let i=0; i<data.length; i++ ) {
              var menuItem = document.createElement('option')
              console.log([data[i]['copies_available']])
              if ([data[i]['copies_available']] != 0){
                menuItem.textContent = [data[i]['title']];
                menuItem.value = data[i]['book_id'] ;
                select.appendChild(menuItem)
              }
          }
      } else {
          console.log("Error in network request: " + req.statusText);
        }
  });
  event.preventDefault();
  while(select.firstChild){
      select.removeChild(select.firstChild);
  }
})

// removes badge from display
document.getElementById('BookId').addEventListener('click', function(){
  document.getElementById("message").textContent = ""
})