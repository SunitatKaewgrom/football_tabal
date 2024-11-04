from flask import Flask, request, jsonify
from flask_cors import CORS
from config import get_db_connection
from models.league import get_all_leagues, get_league_by_id, create_league, update_league, delete_league
from models.teams import get_all_teams, get_team_by_id, create_team, update_team, delete_team
from werkzeug.utils import secure_filename
from datetime import datetime
from bcrypt import hashpw, gensalt
import bcrypt
import os

app = Flask(__name__)
CORS(app)  # เปิดใช้งาน CORS

@app.route('/api/admins', methods=['GET'])
def get_admins():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM admins")
    admins = cursor.fetchall()
    conn.close()
    return jsonify(admins)

@app.route('/api/admins', methods=['POST'])
def add_admin():
    data = request.json
    hashed_password = hashpw(data['password'].encode('utf-8'), gensalt())
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("INSERT INTO admins (username, password) VALUES (%s, %s)", (data['username'], hashed_password))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Admin added successfully'}), 201

@app.route('/api/admins/<int:id>', methods=['PUT'])
def update_admin(id):
    data = request.json
    hashed_password = hashpw(data['password'].encode('utf-8'), gensalt())
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE admins SET username=%s, password=%s WHERE id=%s", (data['username'], hashed_password, id))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Admin updated successfully'})

@app.route('/api/admins/<int:id>', methods=['DELETE'])
def delete_admin(id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM admins WHERE id=%s", (id,))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Admin deleted successfully'})


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

@app.route('/api/header-message', methods=['GET', 'POST'])
def header_message():
    if request.method == 'GET':
        # ดึงข้อมูลจากฐานข้อมูลเพื่อแสดงในหน้าเว็บ
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT description, link_url, image_url, updated_at FROM header_messages LIMIT 1")
        data = cursor.fetchone()
        conn.close()
        
        # ตรวจสอบว่ามีข้อมูลอยู่ในฐานข้อมูลหรือไม่
        if data:
            return jsonify(data), 200
        else:
            return jsonify({'message': 'No record found'}), 404

    elif request.method == 'POST':
        # รับข้อมูลจากฟอร์ม
        description = request.form.get('description')
        link_url = request.form.get('link_url')
        image = request.files.get('image')
        
        conn = get_db_connection()
        cursor = conn.cursor()

        # ตรวจสอบว่ามีข้อมูลเดิมอยู่แล้วหรือไม่
        cursor.execute("SELECT id, image_url FROM header_messages LIMIT 1")
        record = cursor.fetchone()

        if record:
            # อัปเดตข้อมูลข้อความและลิงก์
            cursor.execute("""
                UPDATE header_messages 
                SET description=%s, link_url=%s, updated_at=NOW() 
                WHERE id=%s
            """, (description, link_url, record[0]))

            # จัดการอัปเดตรูปภาพใหม่ถ้ามีการอัปโหลด
            if image:
                if record[1]:
                    old_image_path = os.path.join(UPLOAD_FOLDER, record[1])
                    if os.path.exists(old_image_path):
                        os.remove(old_image_path)  # ลบรูปภาพเก่าที่มีอยู่

                # บันทึกรูปภาพใหม่และอัปเดตในฐานข้อมูล
                image_filename = f"{datetime.now().strftime('%Y-%m-%d_%H.%M.%S')}_{image.filename}"
                image.save(os.path.join(UPLOAD_FOLDER, image_filename))
                cursor.execute("UPDATE header_messages SET image_url=%s WHERE id=%s", (image_filename, record[0]))

        else:
            # เพิ่มข้อมูลใหม่เมื่อไม่มีข้อมูลเดิม
            image_filename = None
            if image:
                image_filename = f"{datetime.now().strftime('%Y-%m-%d_%H.%M.%S')}_{image.filename}"
                image.save(os.path.join(UPLOAD_FOLDER, image_filename))

            cursor.execute("""
                INSERT INTO header_messages (description, link_url, image_url, updated_at) 
                VALUES (%s, %s, %s, NOW())
            """, (description, link_url, image_filename))
        
        conn.commit()
        conn.close()
        return jsonify({'message': 'Record updated successfully.'}), 200


@app.route('/api/leagues', methods=['POST'])
def create_league_route():
    name = request.form.get('name')
    logo_file = request.files.get('logo_file')

    # พิมพ์ข้อมูลเพื่อดูใน console ว่าฟิลด์ name และ logo_file ได้รับข้อมูลถูกต้องหรือไม่
    print("Received name:", name)
    print("Received logo_file:", logo_file)

    # ตรวจสอบว่า name มีค่าและไม่ใช่ NULL
    if not name:
        return jsonify({"error": "The 'name' field is required and cannot be null."}), 400

    new_league = create_league(name, logo_file)
    return jsonify(new_league), 201


@app.route('/api/leagues', methods=['GET'])
def get_leagues():
    leagues = get_all_leagues()
    return jsonify(leagues), 200

@app.route('/api/leagues/<int:league_id>', methods=['GET'])
def get_league(league_id):
    league = get_league_by_id(league_id)
    if league:
        return jsonify(league), 200
    return jsonify({"error": "League not found"}), 404

@app.route('/api/leagues/<int:league_id>', methods=['PUT'])
def update_league_route(league_id):
    name = request.form.get('name')
    logo_file = request.files.get('logo_file')
    updated_league = update_league(league_id, name, logo_file)
    if updated_league:
        return jsonify(updated_league), 200
    return jsonify({"error": "League not found"}), 404

@app.route('/api/leagues/<int:league_id>', methods=['DELETE'])
def delete_league_route(league_id):
    success = delete_league(league_id)
    if success:
        return jsonify({"message": "League deleted"}), 200
    return jsonify({"error": "League not found"}), 404

# Endpoint สำหรับดึงข้อมูลทีมทั้งหมด
@app.route('/api/teams', methods=['GET'])
def get_teams():
    teams = get_all_teams()
    return jsonify(teams)

# Endpoint สำหรับดึงข้อมูลทีมตาม ID
@app.route('/api/teams/<int:team_id>', methods=['GET'])
def get_team(team_id):
    team = get_team_by_id(team_id)
    return jsonify(team) if team else ('Team not found', 404)

# Endpoint สำหรับสร้างทีมใหม่
@app.route('/api/teams', methods=['POST'])
def add_team():
    data = request.form
    name = data.get('name')
    league_id = data.get('league_id')
    logo_file = request.files.get('logo_file')

    if logo_file:
        logo_path = f'static/uploads/img_team/{logo_file.filename}'
        logo_file.save(logo_path)
    else:
        logo_path = None

    # เรียกใช้ฟังก์ชันสร้างทีมใหม่จาก teams.py
    create_team(name, league_id, logo_path)
    return ('Team created', 201)

# Endpoint สำหรับอัปเดตข้อมูลทีมที่มีอยู่
@app.route('/api/teams/<int:team_id>', methods=['PUT'])
def edit_team(team_id):
    data = request.form
    name = data.get('name')
    league_id = data.get('league_id')
    logo_file = request.files.get('logo_file')

    if logo_file:
        logo_path = f'static/uploads/img_team/{logo_file.filename}'
        logo_file.save(logo_path)
    else:
        logo_path = None

    # เรียกใช้ฟังก์ชันอัปเดตทีมจาก teams.py
    update_team(team_id, name, league_id, logo_path)
    return ('Team updated', 200)

# Endpoint สำหรับลบทีมตาม ID
@app.route('/api/teams/<int:team_id>', methods=['DELETE'])
def remove_team(team_id):
    # เรียกใช้ฟังก์ชันลบทีมจาก teams.py
    delete_team(team_id)
    return ('Team deleted', 200)


if __name__ == '__main__':
    app.run(debug=True)