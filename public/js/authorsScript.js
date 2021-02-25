const baseUrl = `http://flip3.engr.oregonstate.edu:3103/authors`


// deletes table children elements.
const deleteTable = () => { 
    let parent =  document.getElementById("workoutsTable")
    parent.classList.add('container')
    while(parent.firstChild){
        parent.removeChild(parent.firstChild);
    }
}

// builds table with data from mysql database.
const makeTable = (allRows) => {
    deleteTable();
    let table = document.createElement("table");
    table.classList.add('container');
    document.getElementById("workoutsTable").appendChild(table);
    makeHeaderRow(table);
    for(row in allRows){
        makeRow(allRows[row], table)
    }
};

// makes the headers of the table.
const makeHeaderRow = (table) => {
    let headRow = document.createElement("tr");
    tags = ["Author ID", "First Name", "Middle Name", "Last Name"]
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
    
    for(let i=0; i<4; i++ ) {
        let cell = document.createElement("td");
        makeInput(i, rowData, cell);
        row.appendChild(cell);
        table.appendChild(row);
    }
    updateButton(row, rowData, table);
    deleteButton(row, rowData);
};

// creates 4 inputs containg data either from the database or from the client.
const makeInput = (type1, value1, cell) => {
    let input = document.createElement("input");
    let label = document.createElement("label");
    let form = document.createElement("form")

    if (type1 == 0){
        input.type = "number";
        input.id = "input-id";
        input.value= value1["auth_id"];
        input.disabled = true;
    }
    else if (type1 == 1){
        input.type = "text";
        input.value= value1["auth_first_name"];
        input.disabled = true;
    }
    else if (type1 == 2){
        input.type= "text ";
        input.value= value1["auth_mid_name"];
        input.disabled = true;
    }
    else if (type1 == 3){
        input.type= "text";;
        input.value= value1["auth_last_name"];
        input.disabled = true;
    }
    // else if (type1 == 4){
    //     input.type = "number";
    //     input.value= value1["year"];
    //     input.disabled = true;
    // }
    // else if (type1 == 5){
    //     input.type= "number";
    //     input.value= value1["copies_available"];
    //     input.disabled = true;
    // }
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
        let rowId = rowData["auth_id"]
        row.removeChild(row.children[4]);
        doneButton = document.createElement("button");
        doneButton.textContent = "Done";
        doneButton.classList.add("btn","btn-info")
        row.insertBefore(doneButton, row.children[4]);
        enableRow(rowId, table);
        // if done button is clicked, new input is send to the database. 
        doneButton.addEventListener("click", function(event){
            doneUpdate(rowData, table);
            row.removeChild(row.children[4]);
            row.insertBefore(aCell, row.children[4]);
            disableRow(rowId, table)
            
        })
        event.preventDefault();
    }   
)};

// sends client's new/updated input data to the database.
const doneUpdate = (rowData, table) => {
        let rowId = rowData["auth_id"]
        console.log("id: ", rowId)
        let numElement = table.childElementCount
        let inputName, inputReps, inputWeight, inputUnit, inputDate;
        for(let i=1; i< numElement; i++ ){
            parent = table.children[i].children[0].children[1].value;
            if (rowId == parent){
                    inputName = table.children[i].children[1].children[1].value;
                    inputReps = table.children[i].children[2].children[1].value;
                    inputWeight = table.children[i].children[3].children[1].value;
                    // inputUnit = table.children[i].children[4].children[1].value;
                    // inputDate = table.children[i].children[5].children[1].value;
            }
        }
        let unitValue;
        // convertes the values of lbs and kgs to 0 or 1. 
        if(inputUnit == "lbs"){
            unitValue = 0
        }else if (inputUnit == "kgs"){
            unitValue = 1
        }
        let req = new XMLHttpRequest();
        let payload = {id:null, name:null, reps:null, weight:null, unit:null, date:null}; 
        payload.id = rowId;
        payload.name = inputName;
        payload.reps = inputReps;
        payload.weight = inputWeight;
        payload.unit = unitValue;
        payload.date = inputDate;
        req.open('PUT', baseUrl, true);
        req.setRequestHeader('Content-Type', 'application/json');
        req.addEventListener('load',function(){
            if(req.status >= 200 && req.status < 400){
                let response = JSON.parse(req.responseText);
                getData();
            } else {
                console.log("Error in network request: " + req.statusText);
            }});
        req.send(JSON.stringify(payload));  
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
        console.log("YOU pressed delete button and row id:", rowData["book_id"]);
        let req = new XMLHttpRequest();
        let payload = {id:null}; // creates an object
        payload.id = rowData["book_id"];
        req.open('DELETE', baseUrl, true);
        req.setRequestHeader('Content-Type', 'application/json');
        req.addEventListener('load',function(){
            if(req.status >= 200 && req.status < 400){
                let response = JSON.parse(req.responseText);;
                getData();
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
            console.log(table.children[i].children[0].children[1].value)
            if (rowId == parent){
                table.children[i].children[1].children[1].disabled = false;
                table.children[i].children[2].children[1].disabled = false;
                table.children[i].children[3].children[1].disabled = false;
                // table.children[i].children[4].children[1].disabled = false;
                // table.children[i].children[5].children[1].disabled = false;
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
            // table.children[i].children[4].children[1].disabled = true;
            // table.children[i].children[5].children[1].disabled = true;
        }
    }
};

// GET REQUEST
document.addEventListener('DOMContentLoaded', getData);
function getData(){
    document.getElementById('searchAuthor').addEventListener('click', function(event){
    var req = new XMLHttpRequest();
    let author_id = document.getElementById('auth_id').value; // stores input values.
    let first_name = document.getElementById('first_name').value;
    let author_last_name = document.getElementById('last_name').value;
    if (first_name && author_last_name){
        req.open('GET', baseUrl + '?first_name=' + first_name + '&author_last_name=' + author_last_name , true);
    } else if (author_id){
        req.open('GET', baseUrl + '?auth_id=' + author_id, true);
    } else if (first_name) {
        req.open('GET', baseUrl + '?first_name=' + first_name, true);
    } else if (author_last_name){
        req.open('GET', baseUrl + '?author_last_name=' + author_last_name, true);
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

// POST request
document.getElementById('addAuthor').addEventListener('click', function(event){
    let req = new XMLHttpRequest();
    let payload = {auth_first_name:null, auth_mid_name:null, auth_last_name:null};
    payload.auth_first_name = document.getElementById('fname').value;
    payload.auth_mid_name = document.getElementById('mname').value;
    payload.auth_last_name = document.getElementById('lname').value;
    req.open('POST', baseUrl, true);
    req.setRequestHeader('Content-Type', 'application/json');
    req.addEventListener('load',function(){
      if(req.status >= 200 && req.status < 400){
        let response = JSON.parse(req.responseText);
        getData();
      } else {
        console.log("Error in network request: " + req.statusText);
      }});
    
     if(payload.auth_first_name !== "" && payload.auth_last_name !== "") {
        req.send(JSON.stringify(payload));
     }
    // clears form fields.
    document.getElementById("fname").value = "";
    document.getElementById("mname").value = "";
    document.getElementById("lname").value = "";
    event.preventDefault();
  });


// getData();