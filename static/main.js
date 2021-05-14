const page_cont = document.getElementById("book-info");
let prev_cursors = [];


document.addEventListener("DOMContentLoaded", () => {
    console.log("hii")
    let xhr = new XMLHttpRequest();
    xhr.onload = function(){
        let data = JSON.parse(xhr.responseText);
        paginate(data);
        console.log("data");
    };
    xhr.open('GET', 'http://127.0.0.1:5000/v1/books', true);
    xhr.send();
});


function onFormSubmit(){
    if(validate()){
        let formData = new FormData();
        formData.append('book_name', document.getElementById("book_name").value);
        formData.append('author_name', document.getElementById("author_name").value);
        formData.append('isbn', document.getElementById("isbn").value);
        let xhr = new XMLHttpRequest();
        xhr.onload = function(){
            let res = JSON.parse(xhr.responseText);
            console.log(res);
        }
        xhr.open('POST', 'http://127.0.0.1:5000/v1/forms', true);
        xhr.send(formData);
        resetForm();
    }
}


function resetForm(){
    document.getElementById("book_name").value = "";
    document.getElementById("author_name").value = "";
    document.getElementById("isbn").value = "";
}


function paginate(data){
    console.log(data);
    let disString = `
        <table border="1px solid black">
            <thead>
                <tr>
                    <th>BookId</th>
                    <th>BookName</th>
                    <th>AuthorName</th>
                    <th>ISBN</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
    `
    books = data["books"];
    function createRow(book,index){
        disString += `
            <tr id="${book.book_id}">
                <td>${book.book_id}</td>
                <td contenteditable="true" onblur="edit(this)" title="book_name">${book.book_name}</td>
                <td contenteditable="true" onblur="edit(this)" title="author_name">${book.author_name}</td>
                <td contenteditable="true" onblur="edit(this)" title="isbn">${book.isbn}</td>
                <td><button style="display: inline-block" id="del-btn" onclick="del(this)">Delete</button></td>
            </tr>`
    };
    books.forEach(createRow);
    disString+=`</tbody></table><button id="prev">Previous</button><button id="next">Next</button>`
    page_cont.innerHTML = disString;
    if(!data['more']){
        document.getElementById("next").disabled = true;
    }
    if(data['curr_cursor']===null){
        document.getElementById("prev").disabled = true;
    }
    document.getElementById("next").onclick = function() {nextPage(data['next_cursor']);};
    prev_cursors.push(data['curr_cursor']);
    console.log(prev_cursors);
    document.getElementById("prev").onclick = function() {prevPage();};
};


function nextPage(curr_cursor){
    let xhr = new XMLHttpRequest();
    xhr.onload = function(){
        let data = JSON.parse(xhr.responseText);
        paginate(data);
        console.log("data");
    };
    xhr.open('GET', 'http://127.0.0.1:5000/v1/books?cursor='+curr_cursor, true);
    xhr.send();
}


function prevPage(){
    prev_cursors.pop();
    curr_cursor = prev_cursors.pop();
    let xhr = new XMLHttpRequest();
    xhr.onload = function(){
        let data = JSON.parse(xhr.responseText);
        paginate(data);
        console.log("data");
    };
    if(curr_cursor!==null){
        xhr.open('GET', 'http://127.0.0.1:5000/v1/books?cursor='+curr_cursor, true);
        xhr.send();
    }
    else{
        xhr.open('GET', 'http://127.0.0.1:5000/v1/books', true);
        xhr.send();
    }
}


function edit(data){
    console.log("inside edit");
    console.log(data.parentElement.id)
    console.log(data.innerHTML);
    console.log(data.title);
    let my_data = new FormData();
    my_data.append('key', data.title);
    my_data.append('value', data.innerHTML);
    let xhr = new XMLHttpRequest();
    xhr.onload = function(){
        let res = JSON.parse(xhr.responseText);
        console.log(res);
    }
    xhr.open('PUT', 'http://127.0.0.1:5000/v1/books/'+data.parentElement.id, true);
    xhr.send(my_data);
}


function del(data){
    console.log("inside delete");
    console.log(data.parentElement.parentElement.id)
    let xhr = new XMLHttpRequest();
    xhr.onload = function(){
        let res = JSON.parse(xhr.responseText);
        console.log(res);
    }
    xhr.open('DELETE', 'http://127.0.0.1:5000/v1/books/'+data.parentElement.parentElement.id, true);
    xhr.send();
    data.parentElement.parentElement.remove();
}


function validate(){
    isValid = true;
    if(document.getElementById("book_name").value === "" || document.getElementById("author_name").value === "" || document.getElementById("isbn").value === ""){
        isValid = false;
        document.getElementById("validationError").innerHTML = "All the fields are required";
    }
    else{
        document.getElementById("validationError").innerHTML = "";
    }
    return isValid;
}