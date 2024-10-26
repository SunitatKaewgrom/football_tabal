from flask import Flask, request, jsonify
from flask_cors import CORS
import bcrypt

app = Flask(__name__)
CORS(app)  # เปิดใช้งาน CORS เพื่อให้การเข้าถึงจาก Angular ทำได้

# ข้อมูลตัวอย่างจากฐานข้อมูล (username และ hashed password)
users = {
    "admin": bcrypt.hashpw(b"123456", bcrypt.gensalt())  # bcrypt hashed password for '123456'
}

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password').encode('utf-8')  # แปลงรหัสผ่านที่รับมาให้เป็น bytes

    print("Received Username:", username)
    print("Received Password:", password)

    # ตรวจสอบ username และ password
    if username in users:
        stored_password_hash = users[username]
        # ตรวจสอบว่ารหัสผ่านแฮชตรงกับรหัสผ่านที่ผู้ใช้กรอกเข้ามาหรือไม่
        if bcrypt.checkpw(password, stored_password_hash):
            print("Login successful")
            return jsonify({'token': 'fake-jwt-token'}), 200
        else:
            print("Login failed: Invalid password")
            return jsonify({'error': 'Invalid credentials'}), 401
    else:
        print("Login failed: Username not found")
        return jsonify({'error': 'Invalid credentials'}), 401

if __name__ == '__main__':
    app.run(debug=True)
