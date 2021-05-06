from flask import Flask, request, redirect, url_for, render_template, abort, jsonify, session
from google.cloud import ndb
import json
import os
import uuid
app = Flask(__name__)
app.config['SECRET_KEY'] = "hieuhgnthisli"


class Book(ndb.Model):
    book_id = ndb.StringProperty()
    book_name = ndb.StringProperty()
    author_name = ndb.StringProperty()
    isbn = ndb.StringProperty()


class User(ndb.Model):
    user_name = ndb.StringProperty()
    password = ndb.StringProperty()


@app.before_request
def check():
    valid_routes = ['login', 'signup']
    print(session)
    print(request.endpoint)
    if request.endpoint not in valid_routes and 'sess_id' not in session:
        return render_template('login.html', display="You are not logged in")


@app.route('/', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        session.pop('sess_id', None)
        username = request.form.get('Username')
        password = request.form.get('Password')
        client = ndb.Client()
        with client.context():
            query1 = User.query()
            query2 = query1.filter(User.user_name == username)
            flag = False
            for i in query2:
                flag = True
                curr_user = i.user_name
                curr_pass = i.password
            if not flag:
                return render_template('login.html', display="Invalid username or password")
            else:
                if curr_user == username and curr_pass == password:
                    session['sess_id'] = curr_user
                    return redirect('/home')
                else:
                    return render_template('login.html', display="Invalid username or password")
    return render_template('login.html')


@app.route('/logout')
def logout():
    session.pop('sess_id', None)
    return redirect('/')


@app.route('/signup', methods=['GET', 'POST'])
def signup():
    if request.method == 'POST':
        client = ndb.Client()
        with client.context():
            user1 = User(user_name=request.form.get('Username'),
                         password=request.form.get('Password'))
            user1.key = ndb.Key('User', str(uuid.uuid4()))
            user1.put()
        return redirect('/')
    return render_template('signup.html')


@app.route('/home')
def home():
    # with open("static/data/db.json", 'r') as f1:
    #     data = json.load(f1)
    # books_db = data
    books_db = {}
    client = ndb.Client()
    with client.context():
        query = Book.query()
        for book in query:
            books_db.update({book.book_id: {'book_name': book.book_name,
                                            'author_name': book.author_name,
                                            'isbn': book.isbn}})
    return render_template('home.html', books=books_db, mode=os.environ.get('LIBRARY_APP_ADMIN'))


@app.route('/display', methods=['POST'])
def display():
    # with open("static/data/db.json", 'r') as f1:
    #     data = json.load(f1)
    # books_db = data
    # books_db.update({request.form.get('book_id'): {"book_name": request.form.get('book_name'),
    #                                                "author_name": request.form.get('author_name'),
    #                                                "isbn": request.form.get('isbn')}})
    client = ndb.Client()
    with client.context():
        query1 = Book.query()
        query2 = query1.filter(Book.book_id == request.form.get('book_id'))
        flag = False
        for i in query2:
            flag = i.book_name
        if not flag:
            book1 = Book(book_id=request.form.get('book_id'),
                         book_name=request.form.get('book_name'),
                         author_name=request.form.get('author_name'),
                         isbn=request.form.get('isbn'))
            book1.key = ndb.Key('Book', str(uuid.uuid4()))
            book1.put()
        else:
            for book in query2:
                book.book_name = request.form.get('book_name')
                book.author_name = request.form.get('author_name')
                book.isbn = request.form.get('isbn')
            book.key = book.put()
    # with open("static/data/db.json", 'w') as f2:
    #     json.dump(books_db, f2)
    return redirect('/')


@app.route('/delete/<book_num>')
def delete(book_num):
    # with open("static/data/db.json", 'r') as f1:
    #     data = json.load(f1)
    # books_db = data
    # x = books_db.pop(book_num)
    # print(x)
    # with open("static/data/db.json", 'w') as f2:
    #     json.dump(books_db, f2)
    client = ndb.Client()
    with client.context():
        query1 = Book.query()
        query2 = query1.filter(Book.book_id == book_num)
        for book in query2:
            book.key.delete()
    return redirect('/')


@app.route('/edit/<book_num>')
def edit(book_num):
    # f1 = open("static/data/db.json", 'r')
    # data = json.load(f1)
    # f1.close()
    # books_db = data
    # old_data = books_db.get(book_num)
    old_data = {}
    client = ndb.Client()
    with client.context():
        query1 = Book.query()
        query2 = query1.filter(Book.book_id == book_num)
        for book in query2:
            old_data = {'book_name': book.book_name,
                        'author_name': book.author_name,
                        'isbn': book.isbn}
            print(book.key)
    print(old_data)
    return render_template('edit.html', book_id=book_num, values=old_data)


@app.route('/v1/books/<book_id>', methods=['PUT'])
def is_id(book_id):
    books_db = []
    client = ndb.Client()
    with client.context():
        query = Book.query()
        for book in query:
            books_db.append({'book_id': book.book_id,
                             'book_name': book.book_name,
                             'author_name': book.author_name,
                             'isbn': book.isbn})
    req_id = request.json.get('taken_by')
    res = [book for book in books_db if book.get('book_id') == book_id]
    if len(res) != 0:
        return jsonify(success=True)
    else:
        return jsonify(success=False, error='book_id not found')


@app.route('/v1/books', methods=['POST', 'GET'])
def books_list():
    books_db = []
    client = ndb.Client()
    with client.context():
        query = Book.query()
        for book in query:
            books_db.append({'book_id': book.book_id,
                             'book_name': book.book_name,
                             'author_name': book.author_name,
                             'isbn': book.isbn})
    print(books_db)
    if request.method == 'POST':
        req_id = request.json.get('book_id')
        res = [book for book in books_db if book.get('book_id') == req_id]
        if len(res) == 0:
            client = ndb.Client()
            with client.context():
                book1 = Book(book_id=request.form.get('book_id'),
                             book_name=request.form.get('book_name'),
                             author_name=request.form.get('author_name'),
                             isbn=request.form.get('isbn'))
                book1.key = ndb.Key('Book', str(uuid.uuid4()))
                book1.put()
            return jsonify({'status': "successfully added", "books": books_db})
        else:
            # return jsonify(error="id already exists")
            abort(400, description="id already exists")
    return jsonify(success=True, books=books_db)


if __name__ == '__main__':
    # os.environ['DATASTORE_DATASET'] = 'igneous-gamma-312008'
    # os.environ['DATASTORE_EMULATOR_HOST'] = 'localhost:8081'
    # os.environ['DATASTORE_EMULATOR_HOST_PATH'] = 'localhost:8081/datastore'
    # os.environ['DATASTORE_HOST'] = 'http://localhost:8081'
    # os.environ['DATASTORE_PROJECT_ID'] = 'igneous-gamma-312008'
    # print(os.environ.get('DATASTORE_DATASET'))
    # print(os.getenv('DATASTORE_EMULATOR_HOST'))
    # print(os.getenv('LIBRARY_APP_ADMIN'))
    app.run(debug=True)
