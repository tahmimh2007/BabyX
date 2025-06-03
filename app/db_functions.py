import os
import sqlite3
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
    cur.execute('''
        CREATE TABLE IF NOT EXISTS whiteboards (
            user_id INTEGER PRIMARY KEY,
            content TEXT NOT NULL,
            FOREIGN KEY(user_id) REFERENCES users(user_id)
        );
    ''')
    cur.execute('''
        CREATE TABLE IF NOT EXISTS private_whiteboards (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            content TEXT NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(user_id)
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

def get_user_id(username):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT user_id FROM users WHERE username = ?", (username,))
    row = cur.fetchone()
    conn.close()
    return row['user_id'] if row else None

def save_whiteboard_content(user_id, content):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("REPLACE INTO whiteboards (user_id, content) VALUES (?, ?)", (user_id, content))
    cur.execute("INSERT INTO private_whiteboards (user_id, content) VALUES (?, ?)", (user_id, content))
    conn.commit()
    conn.close()

def load_whiteboard_content(user_id):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT content FROM whiteboards WHERE user_id = ?", (user_id,))
    row = cur.fetchone()
    conn.close()
    return row['content'] if row else ""

