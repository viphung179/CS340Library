document.getElementById('submit').addEventListener('click', function(event){
    let req = new XMLHttpRequest();
    let info = {fname: null, mname: null, lname: null, emai: null, zipcode: null};
    info.email = document.getElementById('email').value;
    info.fname = document.getElementById('fname').value;
    info.mname = document.getElementById('mname').value;
    info.lname = document.getElementById('lname').value;
    info.zipcode = document.getElementById('zip').value;
    req.open('POST', 'http://httpbin.org/post', true);
    req.setRequestHeader('Content-Type', 'application/json');
    req.addEventListener('load',function(){
      if(req.status >= 200 && req.status < 400){
        let response = JSON.parse(req.responseText);
        console.log(response)
        alert("Sign Up Successful!")
      } else {
        console.log("Error in network request: " + req.statusText);
      }});
    
    if(info.email != "" && info.fname != "" && info.lname != "" && info.zicode != "") {
        req.send(JSON.stringify(info));
        console.log("sent");
    } else {
        alert("Please fill in all required fields before submitting.")
    }

    event.preventDefault();
  });

  