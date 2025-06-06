import os
from flask import Flask, render_template, request, redirect, url_for, session, flash
from flask_socketio import SocketIO, emit

from db_functions import (
    register_user, login_user, create_tables,
    get_user_id, load_whiteboard_content, save_whiteboard_content,
    create_private_whiteboard_entry, load_private_whiteboard, save_private_whiteboard,
    get_private_whiteboards
)

app = Flask(__name__)
app.secret_key = os.environ.get("SECRET_KEY") or os.urandom(32)
socketio = SocketIO(app)

@app.route("/")
def home():
    if "username" not in session:
        return redirect(url_for("login"))
    username = session["username"]
    user_id =get_user_id(username)
    private_boards = get_private_whiteboards(user_id)
    return render_template("home.html", username = username, private_boards = private_boards)

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
    return render_template("register.html")

@app.route("/logout")
def logout():
    user = session.pop("username", None)
    if user:
        flash(f"{user}, you have been logged out.", "success")
    return redirect(url_for("home"))

@app.route("/practice")
def practice():
    if "username" in session:
        return render_template("practice.html", username=session["username"])
    return redirect(url_for("login"))

@app.route("/study_guide")
def study_guide():
    if "username" in session:
        return render_template("study_guide.html", username=session["username"])
    return redirect(url_for("login"))

@app.route("/cs")
def cs():
    if "username" in session:
        return render_template("cs.html", username=session["username"])
    return redirect(url_for("login"))

@app.route("/csQ")
def csQ():
    if "username" in session:
        return render_template("csQ.html", username=session["username"])
    return redirect(url_for("login"))

@app.route("/calc")
def calc():
    if "username" in session:
        return render_template("calc.html", username=session["username"])
    return redirect(url_for("login"))


@app.route("/calcQ")
def calcQ():
    if "username" in session:
        return render_template("calcQ.html", username=session["username"])
    return redirect(url_for("login"))

@app.route("/stats")
def stats():
    if "username" in session:
        return render_template("stats.html", username=session["username"])
    return redirect(url_for("login"))

@app.route("/statsQ")
def statsQ():
    if "username" in session:
        return render_template("statsQ.html", username=session["username"])
    return redirect(url_for("login"))

@app.route("/whiteboard")
def whiteboard():
    if "username" not in session:
        return redirect(url_for("login"))
    user_id = get_user_id(session["username"])
    content = load_whiteboard_content(user_id)
    return render_template("whiteboard.html", content=content)

@app.route("/edit", methods=["POST"])
def edit():
    if "username" not in session:
        return redirect(url_for("login"))

    content = request.form.get("content", "")
    user_id = get_user_id(session["username"])
    if user_id:
        save_whiteboard_content(user_id, content)
        session['whiteboard_content'] = content  # optional local store
        flash("Whiteboard saved.", "success")
    else:
        flash("Failed to save whiteboard.", "error")

    return redirect(url_for("whiteboard"))

@app.route("/create_private_whiteboard")
def create_private_whiteboard():
    if "username" not in session:
        return redirect(url_for("login"))

    user_id = get_user_id(session["username"])
    board_id = create_private_whiteboard_entry(user_id)
    return redirect(url_for("private_whiteboard", board_id=board_id))


@app.route("/private_whiteboard/<int:board_id>", methods=["GET", "POST"])
def private_whiteboard(board_id):
    if "username" not in session:
        return redirect(url_for("login"))

    user_id = get_user_id(session["username"])

    if request.method == "POST":
        content = request.form.get("content", "")
        save_private_whiteboard(user_id, board_id, content)
        flash("Private whiteboard saved successfully.", "success")
        return redirect(url_for("private_whiteboard", board_id=board_id))

    content = load_private_whiteboard(user_id, board_id)
    return render_template("priv_whiteboard.html", content=content, board_id=board_id)

# === SOCKET.IO EVENTS ===

@socketio.on('draw')
def handle_draw(data):
    emit('draw', data, broadcast=True)

@socketio.on('clear')
def handle_clear():
    emit('clear', broadcast=True)

@socketio.on('sync_canvas')
def handle_sync_canvas(data):
    emit('sync_canvas', data, broadcast=True)

@socketio.on('save_canvas')
def handle_save_canvas(data):
    if 'username' in session:
        user_id = get_user_id(session['username'])
        if user_id:
            save_whiteboard_content(user_id, data['image'])

@socketio.on('load_canvas')
def handle_load_canvas():
    if 'username' in session:
        user_id = get_user_id(session['username'])
        if user_id:
            content = load_whiteboard_content(user_id)
            if content:
                emit('load_canvas', {'image': content})

if __name__ == "__main__":
    create_tables()
    socketio.run(app, port=2000, debug=True)

application = app
