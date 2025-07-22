from flask import Flask, send_from_directory
import MySQLdb
import os

app = Flask(__name__, static_folder='../frontend/public', static_url_path='/')

@app.route('/')
def hello():
    db = MySQLdb.connect(host="localhost", user="myuser", passwd="mypassword", db="myappdb")
    cursor = db.cursor()
    cursor.execute("SELECT NOW();")
    now = cursor.fetchone()
    db.close()
    return f"Current DB time: {now[0]}"


def serve():
    return send_from_directory(app.static_folder, 'index.html')

# # Optional: serve static files
# @app.route('/<path:path>')
# def static_proxy(path):
#     file_path = os.path.join(app.static_folder, path)
#     if os.path.exists(file_path):
#         return send_from_directory(app.static_folder, path)
#     return send_from_directory(app.static_folder, 'index.html')


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
