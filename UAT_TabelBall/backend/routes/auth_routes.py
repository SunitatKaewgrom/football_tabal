# routes/auth_routes.py
from flask import Blueprint, request, jsonify, session
from bcrypt import checkpw
from config import get_db_connection

auth_routes = Blueprint('auth_routes', __name__)

@auth_routes.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)
    cursor.execute("SELECT * FROM admins WHERE username = %s", (username,))
    admin = cursor.fetchone()
    cursor.close()
    connection.close()

    if admin and checkpw(password.encode('utf-8'), admin['password'].encode('utf-8')):
        # เก็บสถานะการเข้าสู่ระบบใน session หรือสร้าง token
        session['admin_logged_in'] = True
        return jsonify({'message': 'Login successful'}), 200
    else:
        return jsonify({'message': 'Invalid credentials'}), 401
