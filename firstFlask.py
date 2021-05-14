from flask import Flask, request, redirect, url_for, render_template, abort, jsonify, session
from google.cloud import ndb
import json
import os
import uuid
app = Flask(__name__)
app.config['SECRET_KEY'] = "hieuhgnthisli"


class Book(ndb.Model):
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
    return render_template('home.html', mode=os.environ.get('LIBRARY_APP_ADMIN'))


@app.route('/v1/forms', methods=['POST'])
def form_action():
    client = ndb.Client()
    with client.context():
        book = Book(book_name=request.form.get('book_name'),
                    author_name=request.form.get('author_name'),
                    isbn=request.form.get('isbn'))
        book.key = ndb.Key('Book', uuid.uuid4().hex)
        book.put()
    return jsonify(book_name=book.book_name, author_name=book.author_name, isbn=book.isbn)


@app.route('/v1/books', methods=['GET'])
def books_list():
    REQ_PER_PAGE = 5
    books_db = []
    curr_cursor = None
    prev_cursor = None
    if request.args.get("cursor"):
        curr_cursor = ndb.Cursor(urlsafe=request.args.get("cursor"))
        prev_cursor = curr_cursor.urlsafe().decode()
    print(curr_cursor)
    client = ndb.Client()
    with client.context():
        results, cursor, more = Book.query().fetch_page(REQ_PER_PAGE, start_cursor=curr_cursor)
        if cursor:
            cursor = cursor.urlsafe().decode()
        for book in results:
            books_db.append({'book_id': book.key.id(),
                             'book_name': book.book_name,
                             'author_name': book.author_name,
                             'isbn': book.isbn})
    return jsonify(success=True, books=books_db, more=more, next_cursor=cursor, curr_cursor=prev_cursor)


@app.route('/v1/books/<book_id>', methods=["PUT"])
def edit(book_id):
    name = request.form.get("key")
    value = request.form.get("value")
    client = ndb.Client()
    with client.context():
        book = Book.get_by_id(book_id)
        if name == 'book_name':
            book.book_name = value
        elif name == 'author_name':
            book.author_name = value
        elif name == 'isbn':
            book.isbn = value
        book.put()
    return jsonify(book_name=book.book_name, author_name=book.author_name, isbn=book.isbn)


@app.route('/v1/books/<book_id>', methods=["DELETE"])
def delete(book_id):
    client = ndb.Client()
    with client.context():
        book = Book.get_by_id(book_id)
        book.key.delete()
    return jsonify(success=True, book_id_del=book.key.id())


if __name__ == '__main__':
    os.environ['DATASTORE_DATASET'] = 'igneous-gamma-312008'
    os.environ['DATASTORE_EMULATOR_HOST'] = 'localhost:8081'
    os.environ['DATASTORE_EMULATOR_HOST_PATH'] = 'localhost:8081/datastore'
    os.environ['DATASTORE_HOST'] = 'http://localhost:8081'
    os.environ['DATASTORE_PROJECT_ID'] = 'igneous-gamma-312008'
    print(os.environ.get('DATASTORE_DATASET'))
    print(os.getenv('DATASTORE_EMULATOR_HOST'))
    print(os.getenv('LIBRARY_APP_ADMIN'))
    app.run(debug=True)
