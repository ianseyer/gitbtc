from flask import Flask
from bittrex import *
app = Flask(__name__)

@app.route("/", methods=["POST"])
def digest():
    print(request.body)
    return 200
