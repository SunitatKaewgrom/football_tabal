from flask import Flask, request, jsonify
from flask_cors import CORS
from config import get_db_connection
from werkzeug.utils import secure_filename
from datetime import datetime
import bcrypt
import os

app = Flask(__name__)
CORS(app)  # เปิดใช้งาน CORS

# ฟังก์ชันสำหรับตรวจสอบข้อมูลผู้ใช้
@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password').encode('utf-8')  # เข้ารหัสรหัสผ่านเป็น bytes

    # สร้างการเชื่อมต่อกับฐานข้อมูล
    connection = get_db_connection()
    cursor = connection.cursor()

    try:
        # ตรวจสอบว่า username ตรงกับข้อมูลในฐานข้อมูลหรือไม่
        cursor.execute("SELECT password FROM admins WHERE username = %s", (username,))
        result = cursor.fetchone()

        if result:
            stored_password_hash = result[0].encode('utf-8')  # ดึงค่า password hash
            if bcrypt.checkpw(password, stored_password_hash):  # ตรวจสอบว่ารหัสผ่านถูกต้อง
                print("Login successful")
                return jsonify({'token': 'fake-jwt-token'}), 200
            else:
                print("Login failed: Invalid password")
                return jsonify({'error': 'Invalid credentials'}), 401
        else:
            print("Login failed: Username not found")
            return jsonify({'error': 'Invalid credentials'}), 401
    finally:
        # ปิดการเชื่อมต่อฐานข้อมูล
        cursor.close()
        connection.close()

UPLOAD_FOLDER = 'static/uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# ตรวจสอบให้แน่ใจว่าโฟลเดอร์อัปโหลดมีอยู่
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

@app.route('/api/header-message', methods=['POST'])
def add_header_message():
    description = request.form.get('description')
    link_url = request.form.get('link_url')
    image = request.files.get('image')
    
    conn = get_db_connection()
    cursor = conn.cursor()

    # ตรวจสอบว่ามีข้อมูลในฐานข้อมูลอยู่แล้วหรือไม่
    cursor.execute("SELECT id, image_url FROM header_messages LIMIT 1")
    record = cursor.fetchone()

    if record:
        # อัปเดตข้อมูลข้อความและลิงก์
        cursor.execute("""
            UPDATE header_messages 
            SET description=%s, link_url=%s, updated_at=NOW() 
            WHERE id=%s
        """, (description, link_url, record[0]))

        # ตรวจสอบและอัปเดตรูปภาพ
        if image:
            # ลบรูปภาพเก่าถ้ามี
            if record[1]:
                old_image_path = os.path.join('static/uploads', record[1])
                if os.path.exists(old_image_path):
                    os.remove(old_image_path)

            # บันทึกรูปภาพใหม่
            image_filename = f"{datetime.now().strftime('%Y-%m-%d_%H.%M.%S')}_{image.filename}"
            image.save(os.path.join('static/uploads', image_filename))

            # อัปเดตลิงก์ของรูปภาพในฐานข้อมูล
            cursor.execute("UPDATE header_messages SET image_url=%s WHERE id=%s", (image_filename, record[0]))
    else:
        # เพิ่มข้อมูลใหม่เมื่อไม่มีข้อมูลเดิม
        image_filename = None
        if image:
            image_filename = f"{datetime.now().strftime('%Y-%m-%d_%H.%M.%S')}_{image.filename}"
            image.save(os.path.join('static/uploads', image_filename))

        cursor.execute("""
            INSERT INTO header_messages (description, link_url, image_url, updated_at) 
            VALUES (%s, %s, %s, NOW())
        """, (description, link_url, image_filename))
    
    conn.commit()
    conn.close()
    return jsonify({'message': 'Record updated successfully.'}), 200

if __name__ == '__main__':
    app.run(debug=True)