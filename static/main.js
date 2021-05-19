const page_cont = document.getElementById("book-info");
let prev_cursors = [];
let next_cursor;
let scrollIsActive = false;
let onLoad;


document.addEventListener("DOMContentLoaded", onLoad = () => {
    console.log("hii")
    let xhr = new XMLHttpRequest();
    xhr.onload = function(){
        let data = JSON.parse(xhr.responseText);
        page_cont.innerHTML = "";
        paginate(data);
        console.log("first", next_cursor);
        console.log("data");
    };
    xhr.open('GET', 'http://127.0.0.1:5000/v1/books', true);
    xhr.send();
});


function onFormSubmit(){
    if(validate()){
        book_name = document.getElementById("book_name").value;
        author_name = document.getElementById("author_name").value;
        isbn = document.getElementById("isbn").value;
        let xhr = new XMLHttpRequest();
        xhr.onload = function(){
            let res = JSON.parse(xhr.responseText);
            console.log(res);
            onLoad();
        }
        xhr.open('POST', 'http://127.0.0.1:5000/v1/forms', true);
        xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        xhr.send(JSON.stringify({"book_name": book_name, "author_name": author_name, "isbn": isbn }));
        resetForm();
    }
}


function resetForm(){
    document.getElementById("book_name").value = "";
    document.getElementById("author_name").value = "";
    document.getElementById("isbn").value = "";
}


function paginate(data){
    scrollIsActive = false;
    console.log(scrollIsActive)
    if(!document.getElementById("loader").classList.contains('hide')){
        document.getElementById("loader").classList.add('hide');
    }
    let disString = ``;
    console.log(data);
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
    next_cursor = data["next_cursor"];
    page_cont.insertAdjacentHTML('beforeend', disString);
}


window.addEventListener('scroll',()=>{
    console.log("inside scroll", scrollIsActive)
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
    if (!scrollIsActive && clientHeight + scrollTop >= scrollHeight-5){
        scrollIsActive = true;
        showLoading();
    }
});


function showLoading(){
    document.getElementById("loader").classList.remove('hide');
    if(next_cursor !== null){
        setTimeout(nextPage(next_cursor), 10000);
    }
    else{
        document.getElementById("loader").classList.add('hide');
    }
}


function nextPage(curr_cursor){
    let xhr = new XMLHttpRequest();
    xhr.onload = function(){
        let data = JSON.parse(xhr.responseText);
        paginate(data);
        console.log(data);
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
    let xhr = new XMLHttpRequest();
    xhr.onload = function(){
        let res = JSON.parse(xhr.responseText);
        console.log(res);
    }
    xhr.open('PUT', 'http://127.0.0.1:5000/v1/books/'+data.parentElement.id, true);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.send(JSON.stringify({"key": data.title, "value": data.innerHTML }));
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