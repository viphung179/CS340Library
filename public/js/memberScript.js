const baseUrl = `http://flip3.engr.oregonstate.edu:5149/members`;

document.addEventListener('DOMContentLoaded', getdata);

document.getElementById('signup').addEventListener('click', function(event){
    let req = new XMLHttpRequest();
    let info = {mem_first_name: null, mem_mid_name: null, mem_last_name: null, mem_email: null, mem_zip_code: null};
    info.mem_first_name = document.getElementById('fname').value;
    info.mem_mid_name = document.getElementById('mname').value;
    info.mem_last_name = document.getElementById('lname').value;
    info.mem_email = document.getElementById('email').value;
    info.mem_zip_code = document.getElementById('zip').value;
    
    // if( document.getElementById('kg').checked){
    //     info.unit = 1
    // } else if ( document.getElementById('lbs').checked){
    //     info.unit = 0
    // }
    // info.date = document.getElementById('date').value;
    req.open('POST', baseUrl, true);
    req.setRequestHeader('Content-Type', 'application/json');
    req.addEventListener('load',function(){
      if(req.status >= 200 && req.status < 400){
        let response = JSON.parse(req.responseText);
        deleteTable()
        if (response["rows"].length != 0){
          makeTable(response["rows"])
        }
      } else {
        console.log("Error in network request: " + req.statusText);
        alert("This email has already been used.")
      }});
    
     if(info.mem_first_name !== "" && info.mem_last_name !== "" && info.mem_email !== "" && info.mem_zip_code !== "" ) {
        if (ValidateEmail(info.mem_email)){
          req.send(JSON.stringify(info));
        } else {
          alert("You have entered an invalid email address.")
        }
     } else {
       alert("Please enter all required data.")
     }

    event.preventDefault();
  });

document.getElementById('search').addEventListener('click', function(event){
  let req = new XMLHttpRequest();
  let nameSearch = document.getElementById('nameSearch').value;
  let zipSearch = document.getElementById('zipSearch').value;
  req.open('GET', baseUrl + "?nameSearch=" + nameSearch +  "&zipSearch=" + zipSearch, true);
  req.addEventListener('load',function(){
    if (req.status >= 200 && req.status < 400){
      let response = JSON.parse(req.responseText);
      deleteTable()
      if (response["rows"].length != 0){
        makeTable(response["rows"]);
        // console.log(response["rows"]);
      }
    } else {
      console.log('Error in network request: ' + req.statusText);
    }
  })
  req.send(null);

  event.preventDefault();
});


function getdata() {
  let req = new XMLHttpRequest();
  req.open('GET', baseUrl, true);
  req.addEventListener('load',function(){
      if (req.status >= 200 && req.status < 400){
        let response = JSON.parse(req.responseText);
        if (response["rows"].length != 0){
          makeTable(response["rows"]);
          // console.log(response["rows"]);
        }
      } else {
        console.log('Error in network request: ' + req.statusText);
      }
  })
  req.send(null);
}

function makeTable(rows) {
  let newTable = document.createElement("table");
  newTable.id = 'table';
  newTable.classList.add('container', 'mb-5');
  document.body.appendChild(newTable);

  makeHeaders(newTable);

  makeRow(rows, newTable);

  newTable.addEventListener('click',function(event){
    let target = event.target;
    let targetRow = target.parentNode.parentNode
    let targetId = targetRow.firstElementChild.textContent;
    let memFname = targetRow.firstElementChild.nextElementSibling;
    // console.log(memFname)
    let memLname = memFname.nextElementSibling.nextElementSibling;
    // console.log(memLname)
    let booksChecked = memLname.nextElementSibling.nextElementSibling.nextElementSibling;
    // console.log(memFname)
    if (target.tagName != 'BUTTON') return;
    if (target.textContent == "Delete"){
      deleteRow(targetId);
    } else if (target.textContent == "Update"){
      updateRow(target, targetId);
    } else if (target.textContent == "View Loans/Reservations") {
      let member = {'mem_id': targetId, 'mem_fname': memFname}
      localStorage.setItem('mem_id', targetId);
      localStorage.setItem('mem_fname', memFname.textContent);
      localStorage.setItem('mem_lname', memLname.textContent);
      localStorage.setItem('books_checked', booksChecked.textContent);
      // console.log(localStorage['objectToPass']);
      window.location.href = 'MemberAccount.html'
    }
  })
}

function makeHeaders(newTable) {
  let header = document.createElement("thead");
  newTable.appendChild(header);
  let headerName = ['id','First Name', 'Middle Name', 'Last Name', 'Email', 'Zip Code'];
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
    newRow.appendChild(createTD("number", rows[i].mem_id, "id" + rows[i].mem_id, true));
    newRow.appendChild(createTD("text", rows[i].mem_first_name, "firstName" + rows[i].mem_id));
    newRow.appendChild(createTD("text", rows[i].mem_mid_name, "midName" + rows[i].mem_id));
    newRow.appendChild(createTD("text", rows[i].mem_last_name, "lastName" + rows[i].mem_id));
    newRow.appendChild(createTD("email", rows[i].mem_email, "email"+ rows[i].mem_id));
    newRow.appendChild(createTD("text", rows[i].mem_zip_code, "zipCode"+ rows[i].mem_id));
    let updateCell = document.createElement("td");
    let deleteCell = document.createElement("td");
    let viewCell = document.createElement("td");
    let updateButton = document.createElement("button");
    let deleteButton = document.createElement("button");
    let viewButton = document.createElement("button");
    updateButton.textContent = "Update";
    deleteButton.textContent = "Delete";
    viewButton.textContent = "View Loans/Reservations";
    updateButton.classList.add("btn","btn-info");
    deleteButton.classList.add("btn","btn-info");
    viewButton.classList.add("btn","btn-info");
    updateCell.appendChild(updateButton);
    deleteCell.appendChild(deleteButton);
    viewCell.appendChild(viewButton);
    newRow.appendChild(updateCell);
    newRow.appendChild(deleteCell);
    newRow.appendChild(viewCell)
    body.appendChild(newRow);
  }
}

function deleteRow(rowID) {
  let req = new XMLHttpRequest();
  let info = {id: rowID };
  req.open('DELETE', baseUrl, true);
  req.setRequestHeader('Content-Type', 'application/json');
  req.addEventListener('load',function(){
    if(req.status >= 200 && req.status < 400){
      let response = JSON.parse(req.responseText);
      deleteTable();
      if (response["rows"].length != 0){
        makeTable(response["rows"]);
      }
    } else {
      console.log("Error in network request: " + req.statusText);
    }});
  
  req.send(JSON.stringify(info));
}

function updateRow(button, id) {
  let currentRow = button.parentNode.parentNode
  let inputs = currentRow.getElementsByTagName("input");
  for (let i = 0; i < inputs.length; i++) {
    inputs[i].disabled = false;
  }
  button.textContent = "Done";
  button.addEventListener('click', function(){
    let req = new XMLHttpRequest();
    let info = {mem_first_name: null, mem_mid_name: null, mem_last_name: null, mem_email: null, mem_zip_code: null, mem_id:null};
    info.mem_first_name = document.getElementById('firstName' + id).value;
    info.mem_mid_name = document.getElementById('midName'+ id).value;
    info.mem_last_name = document.getElementById('lastName'+ id).value;
    info.mem_email = document.getElementById('email' + id).value;
    info.mem_zip_code = document.getElementById('zipCode'+ id).value;
    info.mem_id = id;
    req.open('PUT', baseUrl, true);
    req.setRequestHeader('Content-Type', 'application/json');
    req.addEventListener('load',function(){
      if(req.status >= 200 && req.status < 400){
        let response = JSON.parse(req.responseText);
        console.log(response)
        deleteTable();
        if (response["rows"].length != 0){
          makeTable(response["rows"]);
        }
      } else {
        console.log("Error in network request: " + req.statusText);
      }});
    
    if(info.mem_first_name !== ""  && info.mem_last_name !== "" && info.mem_email !== "" && info.mem_zip_code !== "" ) {
        req.send(JSON.stringify(info));
    } else {
      alert("Please enter all fields")
    }
  })

}

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
//   kgRadio.mem_first_name = id;
//   kgRadio.type = "radio";
//   kgRadio.id = "newKg" + id;
//   let lbsRadio = document.createElement("INPUT");
//   let lbsText = document.createTextNode("Lbs");
//   lbsRadio.mem_first_name = id;
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
  let table = document.querySelector("table");
  if (table !== null) {
    table.parentNode.removeChild(table)
  }
}

//https://www.w3resource.com/javascript/form/email-validation.php
function ValidateEmail(mail) 
{
 if (/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(mail))
  {
    return (true)
  }
    // alert("You have entered an invalid email address!")
    return (false)
}