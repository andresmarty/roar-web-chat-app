import os
import datetime

from flask import Flask, session, jsonify, render_template, request, redirect, url_for
from flask_session import Session
from flask_socketio import SocketIO, emit, join_room, leave_room

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
Session(app)
socketio = SocketIO(app)

channels = []

class Channel:
    def __init__(self, channelName):
        self.channelName = channelName
        self.messages = []
    
    def __eq__(self, other):
        if(other == None):
            return False
        return self.channelName == other.channelName
        
    def addMessage(self, message):
        if (len(self.messages) <= 100): 
            self.messages.append(message)
        if (len(self.messages) >= 100):
            self.messages.pop(0)

class Message:
    def __init__(self, user, message, time):
        self.user = user
        self.message = message
        self.time = time


@app.route("/", methods=['GET', 'POST'])
def index():
    currentChannel = None
    print(session.get("activeChannel"))
    if "user" in session:
        user = session.get("user")
        for c in channels:
            if(c.channelName == session.get("activeChannel")):     
                currentChannel = c
                
        return render_template ("main.html", user=user, activeChannel=currentChannel, channels=channels, fromtimestamp=datetime.datetime.fromtimestamp)
    return render_template("login.html")

@app.route("/login", methods=['POST'])
def login():
    if "user" in session:
        return redirect(url_for('index'))
    
    username = request.form.get("username")
    session["user"] = username
    return render_template("main.html", user=username, channels=channels, activeChannel=None)

@socketio.on("submit channel")
def addChannel(data):
    channel = data["channel"]

    c1 = Channel(channelName=channel)
    print(c1.channelName)

    if (channels.count(c1)<1):
        channels.append(c1)
        emit("announce channel", {"channel": channel}, broadcast=True)

@socketio.on('join')
def on_join(data):
    user = session["user"]
    channel = data['channel']
    join_room(channel)
    

@socketio.on("submit message")
def addMessage(data):
    user = session["user"]
    message = data["message"]
    room = data["channel"]
    time = data['time']
    print(time)
    print(room)
    m = Message(user=user, message=message, time=time)
    for c in channels:
        if (c.channelName == room):
            c.addMessage(m)
    emit("announce message", {"message": m.message, "user": m.user, "time":m.time}, room = room)

@socketio.on('leave')
def on_leave(data):
    user = session["user"]
    room = data['channel']
    leave_room(room)

@app.route("/channel/<string:channelName>")
def getChannel(channelName):
    for c in channels:
        if (c.channelName == channelName):
            session["activeChannel"] = channelName
            return jsonify({"channel": toDict(c)})
        
    return jsonify({"error": "Channel not found"}), 404


def toDict(channel):
    messagesDict = []

    for m in channel.messages:
        messagesDict.append(m.__dict__)


    return {"channelName": channel.channelName, "messages": messagesDict}

@app.route("/logout")
def logout():
    session.pop("user", None)
    session.pop("activeChannel", None)
    return render_template("Login.html")
    



