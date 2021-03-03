
const baseUrl = `http://flip3.engr.oregonstate.edu:5149/books`
const extraUrl = 'http://flip3.engr.oregonstate.edu:5149/authors'



// deletes table children elements.
const deleteTable = () => { 
    let parent =  document.getElementById("workoutsTable")
    parent.classList.add('container', 'mb-5')
    while(parent.firstChild){
        parent.removeChild(parent.firstChild);
    }
}

// builds table with data from mysql database.
const makeTable = (allRows) => {
    deleteTable();
    let table = document.createElement("table");
    document.getElementById("workoutsTable").appendChild(table);
    makeHeaderRow(table);
    for(row in allRows){
        makeRow(allRows[row], table)
    }
};

// makes the headers of the table.
const makeHeaderRow = (table) => {
    let headRow = document.createElement("tr");
    tags = ["Book ID", "Title", "ISBN", "Author ID", "Year", "Copies Available"]
    for(let i=0; i<6; i++ ) {
        let headCell = document.createElement("th");
        headCell.textContent = tags[i]
        headRow.appendChild(headCell);
        table.appendChild(headRow);
    }
};

// makes each row of the table.
const makeRow = (rowData, table) => {
    let row = document.createElement("tr");
    
    for(let i=0; i<6; i++ ) {
        let cell = document.createElement("td");
        makeInput(i, rowData, cell);
        row.appendChild(cell);
        table.appendChild(row);
    }
    updateButton(row, rowData, table);
    deleteButton(row, rowData);
};

// creates 6 inputs containg data either from the database or from the client.
const makeInput = (type1, value1, cell) => {
    let input = document.createElement("input");
    let label = document.createElement("label");
    let form = document.createElement("form")

    if (type1 == 0){
        input.type = "number";
        input.id = "input-id";
        input.value= value1["book_id"];
        input.disabled = true;
    }
    else if (type1 == 1){
        input.type = "text";
        input.value= value1["title"];
        input.disabled = true;
    }
    else if (type1 == 2){
        input.type= "text ";
        input.value= value1["isbn"];
        input.disabled = true;
    }
    else if (type1 == 3){
        input.type= "number";;
        input.value= value1["auth_id"];
        input.disabled = true;
    }
    else if (type1 == 4){
        input.type = "number";
        input.value= value1["year"];
        input.disabled = true;
    }
    else if (type1 == 5){
        input.type= "number";
        input.value= value1["copies_available"];
        input.disabled = true;
    }
    cell.appendChild(label);
    cell.appendChild(input);
    cell.appendChild(form);
};

// creates update button and if clicked, allows client to insert input in the row.
const updateButton = (row, rowData, table) => {
    let aCell = document.createElement("td");
    let upButton = document.createElement("button");
    upButton.textContent = "Update";
    upButton.classList.add("btn","btn-info")
    aCell.appendChild(upButton)
    row.appendChild(aCell);
   

    // if update button is clicked, done button is created ad row is enabled for user input.
    upButton.addEventListener("click", function(event){
        let rowId = rowData["book_id"]
        row.removeChild(row.children[6]);
        doneButton = document.createElement("button");
        doneButton.textContent = "Done";
        doneButton.classList.add("btn","btn-info")
        row.insertBefore(doneButton, row.children[6]);
        enableRow(rowId, table);
        // if done button is clicked, new input is send to the database. 
        doneButton.addEventListener("click", function(event){
            doneUpdate(rowData, table);
            row.removeChild(row.children[6]);
            row.insertBefore(aCell, row.children[6]);
            disableRow(rowId, table)
            
        })
        event.preventDefault();
    }   
)};

// sends client's new/updated input data to the database.
const doneUpdate = (rowData, table) => {
        let rowId = rowData["book_id"]
        console.log("id: ", rowId)
        let numElement = table.childElementCount
        let inputTitle, inputISBN, inputAuthId, inputYear, inputCopiesAvailable;
        for(let i=1; i< numElement; i++ ){
            parent = table.children[i].children[0].children[1].value;
            if (rowId == parent){
                    inputTitle = table.children[i].children[1].children[1].value;
                    inputISBN = table.children[i].children[2].children[1].value;
                    inputAuthId = table.children[i].children[3].children[1].value;
                    inputYear = table.children[i].children[4].children[1].value;
                    inputCopiesAvailable = table.children[i].children[5].children[1].value;
            }
        }
        let req = new XMLHttpRequest();
        let payload = {isbn:null, title:null, auth_id:null, year:null, copies_available:null, book_id:null}; 
        payload.isbn = inputISBN;
        payload.title = inputTitle;
        payload.auth_id = inputAuthId;
        payload.year = inputYear;
        payload.copies_available = inputCopiesAvailable;
        payload.book_id = rowId;
        req.open('PUT', baseUrl, true);
        req.setRequestHeader('Content-Type', 'application/json');
        req.addEventListener('load',function(){
            if(req.status >= 200 && req.status < 400){
                let response = JSON.parse(req.responseText);
                //getData();
            } else {
                console.log("Error in network request: " + req.statusText);
            }});
        if(payload.isbn !== "" && payload.title !== "" && payload.auth_id !== "" && payload.year !== "" && payload.year !== "" && payload.copies_available !== "") {
            req.send(JSON.stringify(payload));
        }else{
            displayNewData();
        }
};

// creates delete button and if clicked, deletes selected row(data) from the database. 
const deleteButton = (row, rowData,) => {
    let bCell = document.createElement("td");
    let delButton = document.createElement("button");
    delButton.classList.add("btn","btn-info")
    delButton.textContent = "Delete";
    delButton.class = "deleteButton"
    bCell.appendChild(delButton);
    row.appendChild(bCell)
    //row.appendChild(delButton);   
    delButton.addEventListener("click", function(event){
        console.log("You pressed delete button and row id:", rowData["book_id"]);
        let req = new XMLHttpRequest();
        let payload = {book_id:null}; // creates an object
        payload.book_id = rowData["book_id"];
        req.open('DELETE', baseUrl, true);
        req.setRequestHeader('Content-Type', 'application/json');
        req.addEventListener('load',function(){
            if(req.status >= 200 && req.status < 400){
                let response = JSON.parse(req.responseText);;
                displayNewData();
            } else {
                console.log("Error in network request: " + req.statusText);
            }});
        req.send(JSON.stringify(payload));
        event.preventDefault();
    });
};

// enables row so client can insert new input in the cells.
const enableRow = (rowId, table) => {
        let numElement = table.childElementCount
        for(let i=1; i< numElement; i++ ){
            parent = table.children[i].children[0].children[1].value;
            if (rowId == parent){
                table.children[i].children[1].children[1].disabled = false;
                table.children[i].children[2].children[1].disabled = false;
                table.children[i].children[3].children[1].disabled = false;
                table.children[i].children[4].children[1].disabled = false;
                table.children[i].children[5].children[1].disabled = false;
            }
        }
};

// disables rows
const disableRow = (rowId, table) => {
    let numElement = table.childElementCount
    for(let i=1; i< numElement; i++ ){
        parent = table.children[i].children[0].children[1].value;
        if (rowId == parent){
            table.children[i].children[1].children[1].disabled = true;
            table.children[i].children[2].children[1].disabled = true;
            table.children[i].children[3].children[1].disabled = true;
            table.children[i].children[4].children[1].disabled = true;
            table.children[i].children[5].children[1].disabled = true;
        }
    }
};


// When search button is selected, specified data is retrieved from database.
document.addEventListener('DOMContentLoaded', getData);
function getData(){
    document.getElementById('searchBook').addEventListener('click', function(event){
    var req = new XMLHttpRequest();
    let title = document.getElementById('sTitle').value; // stores input values.
    let isbn = document.getElementById('sIsbn').value;
    let auth_last_name = document.getElementById('auth_last_name').value;
    let year = document.getElementById('sYear').value;
    if (title && isbn && auth_last_name && year){
        req.open('GET', baseUrl + '?title=' + title + '&isbn=' + isbn + '&last_name=' + auth_last_name +'&year=' + year, true);
    } else if (title && auth_last_name && year){
        req.open('GET', baseUrl + '?title=' + title + '&last_name=' + auth_last_name + '&year=' + year, true);
    } else if (title && auth_last_name){
        req.open('GET', baseUrl + '?title=' + title + '&last_name=' + auth_last_name, true);
    }else if (title && year){
        req.open('GET', baseUrl + '?title=' + title + '&year=' + year, true);
    }else if (auth_last_name && year){
        req.open('GET', baseUrl + '?last_name=' + auth_last_name + '&year=' + year, true);
    }else if (title){
        req.open('GET', baseUrl + '?title=' + title, true);
    } else if (isbn) {
        req.open('GET', baseUrl + '?isbn=' + isbn, true);
    } else if (auth_last_name){
        req.open('GET', baseUrl + '?last_name=' + auth_last_name, true);
    } else if (year){
        req.open('GET', baseUrl + '?year=' + year, true);
    } else {
        req.open('GET', baseUrl, true);
    }
    req.send(null);
    req.addEventListener('load',function(){
        if(req.status >= 200 && req.status < 400){
            let response = JSON.parse(req.responseText);
            data = JSON.parse(response.results)
            makeTable(data); 
        } else {
            console.log("Error in network request: " + req.statusText);
          }
    });
    event.preventDefault();
});
}  

// displays updated data when called. Called in Delete Button function. 
const displayNewData = () => {
    var req = new XMLHttpRequest();
    req.open('GET', baseUrl, true);
    req.send(null);
    req.addEventListener('load',function(){
        if(req.status >= 200 && req.status < 400){
            let response = JSON.parse(req.responseText);
            data = JSON.parse(response.results)
            makeTable(data); 
        } else {
            console.log("Error in network request: " + req.statusText);
          }
    });
}

// populating drop down menu for author ID for add book
document.getElementById('auth_id').addEventListener('click', function(event){
    var req = new XMLHttpRequest();
    var select = document.getElementById('select')
    req.open('GET', extraUrl , true);
    req.send(null);
    req.addEventListener('load',function(){
        if(req.status >= 200 && req.status < 400){
            let response = JSON.parse(req.responseText);
            data = JSON.parse(response.results)
            for(let i=0; i<data.length; i++ ) {
                var menuItem = document.createElement('option')
                menuItem.textContent = [data[i]['auth_first_name'] + ' ' + data[i]['auth_last_name'] ];
                menuItem.value = data[i]['auth_id'] ;
                select.appendChild(menuItem)
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

// submits new input data(row) from the user to the database. 
document.getElementById('addBook').addEventListener('click', function(event){
    let req = new XMLHttpRequest();
    let payload = {isbn:null, title:null, auth_id:null, year:null, copies_available:null};
    payload.isbn = document.getElementById('isbn').value;
    payload.title = document.getElementById('title').value;
    payload.auth_id = document.getElementById('auth_id').value;
    payload.year = document.getElementById('year').value;
    payload.copies_available = document.getElementById('copies').value;
    console.log(payload)
    req.open('POST', baseUrl, true);
    req.setRequestHeader('Content-Type', 'application/json');
    req.addEventListener('load',function(){
      if(req.status >= 200 && req.status < 400){
        let response = JSON.parse(req.responseText);
        // places text on badge
        document.getElementById("message").textContent = "Book Added"
        displayNewData();
      } else {
        console.log("Error in network request: " + req.statusText);
      }});
    
     if(payload.isbn !== "" && payload.title !== "" && payload.auth_id !== "" && payload.year !== "" && payload.copies_available !== "") {
        // clears form fields
        document.getElementById("isbn").value = "";
        document.getElementById("title").value = "";
        document.getElementById("auth_id").value = "";
        document.getElementById("year").value = "";
        document.getElementById("copies").value = "";
        req.send(JSON.stringify(payload));
     } else {
        alert("Please enter all required fields to add a book.")
     }
    event.preventDefault();
  });

// removes badge
document.getElementById('title').addEventListener('click', function(){
    document.getElementById("message").textContent = ""
})

displayNewData();