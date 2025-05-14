import sqlite3
import os
from flask import request, session, flash

DB_PATH = os.path.join(os.path.abspath(os.path.dirname(__file__)), 'database.db')

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def create_tables():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute('''
        CREATE TABLE IF NOT EXISTS users (
            user_id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL
        );
    ''')
    conn.commit()
    conn.close()

def add_user(username, password):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("INSERT INTO users (username, password) VALUES (?, ?)", (username, password))
    conn.commit()
    conn.close()

def register_user():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']

        try:
            add_user(username, password)
            return 'success'
        except:
            return 'fail'

def login_user():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']

        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("SELECT * FROM users WHERE username = ? AND password = ?", (username, password))
        user = cur.fetchone()
        conn.close()

        if user:
            session['username'] = username
            flash('Login successful!', 'success')
        else:
            flash('Invalid username or password.', 'error')
