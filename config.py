from flask import Flask
from flask_login import LoginManager

import json

SETTINGS_FILE = open("settings.json", 'r', encoding="UTF-8")
SETTINGS = json.loads(SETTINGS_FILE.read())
UPLOAD_FOLDER = 'instance/storage'
CLAIM_TEMPORARY_FILE = "claims/temp.docx"

app = Flask(__name__)

app.config['MAX_CONTENT_LENGTH'] = 16 * 1000 * 1000
app.config['SECRET_KEY'] = 'MAKKDDDKKDKDKKKKKFJFFJJFFJJFJJF'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

#login_manager = LoginManager(app)
