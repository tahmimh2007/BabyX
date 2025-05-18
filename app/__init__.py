from flask import Flask, render_template, flash, request, redirect, url_for, session
from db_functions import register_user, login_user, create_tables, get_user_id, load_whiteboard_content, save_whiteboard_content
from flask_socketio import SocketIO, emit
import os

app = Flask(__name__)
app.secret_key = os.environ.get("SECRET_KEY") or os.urandom(32)

socketio = SocketIO(app)

@app.route("/")
def home():
    if "username" in session:
        return render_template("home.html", username=session["username"])
    return render_template("home.html")

@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        login_user()
        if "username" in session:
            return redirect(url_for("home"))
        return redirect(url_for("login"))
    return render_template("login.html")

@app.route("/register", methods=["GET", "POST"])
def register():
    if request.method == "POST":
        result = register_user()
        if result == "success":
            flash("Registration successful! Please log in.", "success")
            return redirect(url_for("login"))
        else:
            flash("Registration failed. Username may already exist.", "error")
            return redirect(url_for("register"))
    return render_template("register.html")

@app.route("/logout", methods=["GET", "POST"])
def logout():
    if "username" in session:
        user = session.pop("username")
        flash(f"{user}, you have been logged out.", "success")
    return redirect(url_for("home"))

@app.route("/practice")
def practice():
    if "username" in session:
        return render_template("practice.html")
    return redirect(url_for("login"))

@app.route("/study_guide")
def study_guide():
    if "username" in session:
        return render_template("study_guide.html")
    return redirect(url_for("login"))

@app.route("/whiteboard")
def whiteboard():
    if "username" in session:
        user_id = get_user_id(session["username"])
        content = load_whiteboard_content(user_id)
        return render_template("whiteboard.html", content=content)
    return redirect(url_for("login"))

@app.route("/edit", methods=["POST"])
def edit():
    if "username" not in session:
        return redirect(url_for("login"))

    content = request.form.get("content", "")
    user_id = get_user_id(session["username"])

    if user_id is not None:
        save_whiteboard_content(user_id, content)
        flash("Whiteboard saved.", "success")
    else:
        flash("Failed to save whiteboard.", "error")
    
    return redirect(url_for("whiteboard"))

@socketio.on('draw')
def handle_draw(data):
    emit('draw', data, broadcast=True)

@socketio.on('clear')
def handle_clear():
    emit('clear', broadcast=True)

@socketio.on('sync_canvas')
def handle_sync_canvas(data):
    emit('sync_canvas', data, broadcast=True)

if __name__ == "__main__":
    create_tables()
    socketio.run(app, port=2000, debug=True)

application = app
