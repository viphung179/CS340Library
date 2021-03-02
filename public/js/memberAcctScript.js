const baseUrl = `http://flip3.engr.oregonstate.edu:5149/memberAccount`;
// console.log(localStorage['mem_id']);
// console.log(localStorage['mem_fname']);
let currMemId = localStorage['mem_id'];
let currMemName = localStorage['mem_fname'] + ' ' + localStorage['mem_lname'];
let currBooks = localStorage['books_checked']
// console.log(currMemName)
// localStorage.removeItem('objectToPass')

let userID = document.createElement('h4');
userID.textContent = 'Member ID: ' + currMemId;
userID.classList.add('lead', 'pl-3');
document.body.appendChild(userID);

let userName = document.createElement('h4');
userName.textContent = 'Member Name: ' + currMemName;
userName.classList.add('lead', 'pl-3');
document.body.appendChild(userName);

// let userBooks = document.createElement('h4');
// userBooks.textContent = 'Books Checked Out: ' + currBooks;
// userBooks.classList.add('lead', 'pl-3');
// document.body.appendChild(userBooks);

document.addEventListener('DOMContentLoaded', getdata);

document.getElementById('loanBook').addEventListener('click', function(event){
    let req = new XMLHttpRequest();
    let books= document.getElementById('books').textContent
    let info = {book_id: null, mem_id: currMemId};
    info.book_id = document.getElementById('bookID').value;
    req.open('POST', baseUrl, true);
    req.setRequestHeader('Content-Type', 'application/json');
    req.addEventListener('load',function(){
      if(req.status >= 200 && req.status < 400){
        let response = JSON.parse(req.responseText);
        // alert("helloooo")
        // console.log(response);
        deleteTable()
        makeBooksCheckedOut(response["loans"])
        if (response["loans"].length != 0){
          makeTable(response["loans"]);
        }

        if (response["reserv"].length != 0){
          makeResTable(response["reserv"]);
        }
      } else {
        console.log("Error in network request: " + req.statusText);
      }});
    
     if(info.book_id !== ' ' && books < 5 ) {
        req.send(JSON.stringify(info));
     } else {
       alert("The max amount of active books loans have been reached.")
     }

    event.preventDefault();
  });

document.getElementById('resBook').addEventListener('click', function(event){
    let req = new XMLHttpRequest();
    let info = {book_id: null, mem_id: currMemId};
    info.book_id = document.getElementById('resBookID').value;
    req.open('POST', baseUrl + "res", true);
    req.setRequestHeader('Content-Type', 'application/json');
    req.addEventListener('load',function(){
      if(req.status >= 200 && req.status < 400){
        let response = JSON.parse(req.responseText);
        deleteTable()
        if (response["loans"].length != 0){
          makeTable(response["loans"]);
        }

        if (response["reserv"].length != 0){
          makeResTable(response["reserv"]);
        }
      } else {
        console.log("Error in network request: " + req.statusText);
      }});
    
     if(info.book_id !== "" ) {
        req.send(JSON.stringify(info));
     }

    event.preventDefault();
});

function getdata() {
  let req = new XMLHttpRequest();
  req.open('GET', baseUrl + "?mem_id=" + currMemId, true);
  req.addEventListener('load',function(){
      if (req.status >= 200 && req.status < 400){
        let response = JSON.parse(req.responseText);
        // call function to calc books checked out
        makeBooksCheckedOut(response["loans"])
        // getBooksCheckedOut(response["loans"])
        console.log(response["loans"])
        // console.log(response["loans"].length)
        if (response["loans"].length != 0){
          // console.log(response["loans"].length)
          makeTable(response["loans"]);
        }

        if (response["reserv"].length != 0){
          makeResTable(response["reserv"]);
        }
      } else {
        console.log('Error in network request: ' + req.statusText);
      }
  })
  req.send(null);
}

function getBooksCheckedOut(loans) {
  let booksCheckedOut = 0
  if (loans.length === 0) {
    return booksCheckedOut
  }
  for (let i = 0; i < loans.length; i++) {
    // console.log(loans[i].loan_due_date)
    let dueDate = new Date(loans[i].loan_due_date)
    let newDate = new Date();
    let diffTime = Math.abs(newDate - dueDate)
    let difference = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (difference > 0){
      booksCheckedOut += 1
    }

    // console.log(typeof loans[i].loan_due_date)
  }
  return booksCheckedOut
}

function makeBooksCheckedOut(rows){
  let userBooks = document.createElement('h4');
  userBooks.textContent = 'Books Checked Out: ' + getBooksCheckedOut(rows);
  userBooks.id = 'books'
  userBooks.classList.add('lead', 'pl-3');
  document.body.appendChild(userBooks);
}

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
    let targetId = target.parentNode.parentNode.firstElementChild.textContent;
    if (target.tagName != 'BUTTON') return;
    if (target.textContent == "Delete"){
      deleteRow(targetId);
    } else if (target.textContent == "Update") {
      updateRow(target, targetId);
    } else {
      localStorage.setItem('objectToPass', targetId);
    }
  })
}

function makeHeaders(newTable) {
  let header = document.createElement("thead");
  newTable.appendChild(header);
  let headerName = ['id','Title', 'Author', 'Loan Date', 'Due Date'];
    for (let c = 0; c < headerName.length; c++){
        let newHeader = document.createElement("th");
        newHeader.textContent = headerName[c];

        if (newHeader.textContent == "id") {
          newHeader.style.display = "none";
        }

        header.appendChild(newHeader);
    }
}

function makeRow(rows, newTable){
  let body = document.createElement("tbody");
  newTable.appendChild(body);
  for (let i = 0; i < rows.length; i++) {
    let newRow = document.createElement("tr");
    newRow.appendChild(createTD("number", rows[i].loans_id, "loanId" + rows[i].loan_id, true));
    newRow.appendChild(createTD("text", rows[i].title, "title" + rows[i].loan_id));
    newRow.appendChild(createTD("text", rows[i].auth_first_name + " " + rows[i].auth_last_name, "authName" + rows[i].loan_id));
    // newRow.appendChild(createTD("text", rows[i].mem_last_name, "lastName" + rows[i].id));
    // newRow.appendChild(createTD("email", rows[i].mem_email, "email"+ rows[i].id));
    // newRow.appendChild(createTD("text", rows[i].mem_zip_code, "zipCode"+ rows[i].id));
    // newRow.appendChild(createTD("number", rows[i].books_checked_out, "books"+ rows[i].id));
    // newRow.appendChild(radioInputs(rows[i].unit,rows[i].id));
    newRow.appendChild(createTD("date", rows[i].loan_date.slice(0,10), "loanDate"+ rows[i].loan_id));
    newRow.appendChild(createTD("date", rows[i].loan_due_date.slice(0,10), "dueDate"+ rows[i].loan_id));
    let updateCell = document.createElement("td");
    let updateButton = document.createElement("button");
    updateButton.textContent = "Update";
    updateButton.classList.add("btn","btn-info");
    updateCell.appendChild(updateButton);
    newRow.appendChild(updateCell);
    body.appendChild(newRow);
  }
}

function makeResTable(rows) {
  let newTable = document.createElement("table");
  newTable.id = 'resTable';
  newTable.classList.add('container', 'mb-5');
  let newCardHeader = document.createElement("h5");
  newCardHeader.textContent = "Current and Past Reservations";
  newCardHeader.classList.add('card-header', 'alert-dark', 'text-center', 'mb-1');
  newCardHeader.id = 'resHeader'
  document.body.appendChild(newCardHeader);
  document.body.appendChild(newTable);

  makeResHeaders(newTable);

  makeResRow(rows, newTable);

  newTable.addEventListener('click',function(event){
    let target = event.target;
    let targetRow = target.parentNode.parentNode
    let targetBody = targetRow.parentNode
    let targetId = target.parentNode.parentNode.firstElementChild.textContent;
    if (target.tagName != 'BUTTON') return;
    // if (targetBody.id ==='resBody'){
    if (target.textContent == "Delete"){
      deleteRow(targetId);
    } else if (target.textContent == "Update") {
      updateRow(target, targetId);
    } else {
      localStorage.setItem('objectToPass', targetId);
    }
  })
}

function makeResHeaders(newTable) {
  let header = document.createElement("thead");
  newTable.appendChild(header);
  let headerName = ['id','Title', 'Author', 'Reservation Date', 'Status'];
    for (let c = 0; c < headerName.length; c++){
        let newHeader = document.createElement("th");
        newHeader.textContent = headerName[c];

        if (newHeader.textContent == "id") {
          newHeader.style.display = "none";
        }

        header.appendChild(newHeader);
    }
}

function makeResRow(rows, newTable){
  let body = document.createElement("tbody");
  body.id = 'resBody'
  newTable.appendChild(body);
  for (let i = 0; i < rows.length; i++) {
    let newRow = document.createElement("tr");
    newRow.appendChild(createTD("number", rows[i].res_id, "resId" + rows[i].id, true));
    newRow.appendChild(createTD("text", rows[i].title, "resTitle" + rows[i].id));
    newRow.appendChild(createTD("text", rows[i].auth_first_name + " " + rows[i].auth_last_name, "resAuthName" + rows[i].id));
    newRow.appendChild(createTD("date", rows[i].res_date.slice(0,10), "resDate"+ rows[i].id));
    let rowStatus = "Inactive"
    if(rows[i].res_active == 0){
      rowStatus = "Inactive"
    } else {
      rowStatus = "Active"
    }
    // console.log(rowStatus)
    newRow.appendChild(createTD("text", rowStatus, "resStatus" + rows[i].id));
    let updateCell = document.createElement("td");
    let updateButton = document.createElement("button");
    updateButton.textContent = "Update";
    updateButton.classList.add("btn","btn-info");
    updateCell.appendChild(updateButton);
    newRow.appendChild(updateCell);
    body.appendChild(newRow);
  }
}

// function deleteRow(rowID) {
//   let req = new XMLHttpRequest();
//   let info = {id: rowID, mem_id: currMemId};
//   req.open('DELETE', baseUrl, true);
//   req.setRequestHeader('Content-Type', 'application/json');
//   req.addEventListener('load',function(){
//     if(req.status >= 200 && req.status < 400){
//       let response = JSON.parse(req.responseText);
//       deleteTable();
//       if (response["rows"].length != 0){
//         makeTable(response["rows"]);
//       }
//     } else {
//       console.log("Error in network request: " + req.statusText);
//     }});
  
//   req.send(JSON.stringify(info));
// }

// function updateRow(button, id) {
//   let currentRow = button.parentNode.parentNode
//   let inputs = currentRow.getElementsByTagName("input");
//   for (let i = 0; i < inputs.length; i++) {
//     inputs[i].disabled = false;
//   }
//   button.textContent = "Done";

//   button.addEventListener('click', function(){
//     let req = new XMLHttpRequest();
//     let info = {name: null, reps: null, weight: null, unit: null, date: null, id:null};
//     info.name = document.getElementById('newName' + id).value;
//     info.reps = document.getElementById('newReps'+ id).value;
//     info.weight = document.getElementById('newWeight'+ id).value;
//     if( document.getElementById('newKg' + id).checked){
//         info.unit = 1;
//     } else if ( document.getElementById('newLbs' + id).checked){
//         info.unit = 0;
//     }
//     info.date = document.getElementById('newDate'+ id).value;
//     info.id = id;
//     req.open('PUT', baseUrl, true);
//     req.setRequestHeader('Content-Type', 'application/json');
//     req.addEventListener('load',function(){
//       if(req.status >= 200 && req.status < 400){
//         let response = JSON.parse(req.responseText);
//         deleteTable();
//         if (response["rows"].length != 0){
//           makeTable(response["rows"]);
//         }
//       } else {
//         console.log("Error in network request: " + req.statusText);
//       }});
    
//     if(info.name !== "" && info.reps !== "" && info.weight !== "" && info.unit !== "" && info.date !== "") {
//         req.send(JSON.stringify(info));
//     } else {
//       alert("Please enter all fields")
//     }
//   })
  
// }

function createTD(type, value, id, isID = false) {
  if (isID) {
    let fieldCell = document.createElement("td");
    fieldCell.textContent = value
    fieldCell.style.display = "none"
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

// function radioInputs(value,id) {
//   let radios = document.createElement("span");
//   let kgRadio = document.createElement("INPUT");
//   let kgText = document.createTextNode("Kg");
//   kgRadio.name = id;
//   kgRadio.type = "radio";
//   kgRadio.id = "newKg" + id;
//   let lbsRadio = document.createElement("INPUT");
//   let lbsText = document.createTextNode("Lbs");
//   lbsRadio.name = id;
//   lbsRadio.type = "radio";
//   lbsRadio.id = "newLbs" + id;
//   if (value === 0) {
//     lbsRadio.checked = true;
//   } else {
//     kgRadio.checked = true;
//   }
//   kgRadio.disabled = true;
//   lbsRadio.disabled = true;
//   radios.appendChild(kgRadio);
//   radios.appendChild(kgText);
//   radios.appendChild(lbsRadio);
//   radios.appendChild(lbsText);
//   return radios
// }

function deleteTable(){
  let loantable = document.getElementById('loanTable');
  let loanheading = document.getElementById('loanHeader');
  let booksCount = document.getElementById('books')
  let restable = document.getElementById('resTable');
  let resheading = document.getElementById('resHeader');
  
  if (loantable !== null) {
    loantable.parentNode.removeChild(loantable);
    loanheading.parentNode.removeChild(loanheading);
    booksCount.parentNode.removeChild(booksCount);
    
  }

  if (restable !== null) {
    restable.parentNode.removeChild(restable);
    resheading.parentNode.removeChild(resheading);
  }
}