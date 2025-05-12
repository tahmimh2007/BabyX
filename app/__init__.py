import json
import randomCountry
import sqlite3
from flask import Flask, render_template, request, session, redirect, flash, url_for

app = Flask(__name__)
@app.route("/")
def home():
    return render_template("home.html")


if __name__ == "__main__": #false if this file imported as module
    #enable debugging, auto-restarting of server when this file is modified
    app.debug = True
    app.run()
