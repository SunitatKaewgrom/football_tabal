from flask import Flask, request, jsonify, url_for, abort
from config import get_db_connection
from models.header_message import get_header_message, update_header_message
from models.league import get_all_leagues, get_league_by_id, create_league, update_league, delete_league
from models.teams import get_all_teams, create_team, update_team, delete_team
from models.experts import get_all_experts, get_expert_by_id, create_expert, update_expert, delete_expert
from models.community_expert import get_all_community_expert, add_community_expert, update_community_expert, delete_community_expert
from models.tips_table import fetch_all_matches,add_matches_with_predictions,update_match,delete_match,add_predictions,update_prediction,delete_prediction
from werkzeug.utils import secure_filename
from datetime import datetime ,timedelta
from bcrypt import hashpw, gensalt
from flask_cors import CORS
import json
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

# เส้นทางสำหรับดึงและอัปเดต header message
@app.route('/api/header-message', methods=['GET', 'POST'])
def header_message():
    if request.method == 'GET':
        return get_header_message()

    elif request.method == 'POST':
        return update_header_message()


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
def fetch_all_teams():
    try:
        teams = get_all_teams()  # เรียกฟังก์ชันจาก teams.py
        return jsonify(teams), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Endpoint สำหรับเพิ่มทีมใหม่
@app.route('/api/teams', methods=['POST'])
def create_team_api():
    try:
        name = request.form.get('name')
        league_id = request.form.get('leagueId')
        logo_file = request.files.get('logoFile')  # ไฟล์ที่อัปโหลดมาจากฟอร์ม

        if not name or not league_id:
            return jsonify({'error': 'กรุณาระบุชื่อทีมและลีก'}), 400

        create_team(name, league_id, logo_file)  # ส่งข้อมูลไปให้ teams.py
        return jsonify({'message': 'เพิ่มทีมสำเร็จ'}), 201
    except Exception as e:
        return jsonify({'error': 'เกิดข้อผิดพลาดในการเพิ่มทีม', 'details': str(e)}), 500

# Endpoint สำหรับแก้ไขข้อมูลทีม
@app.route('/api/teams/<int:team_id>', methods=['PUT'])
def update_team_api(team_id):
    try:
        name = request.form.get('name')
        league_id = request.form.get('leagueId')
        logo_file = request.files.get('logoFile')

        update_team(team_id, name, league_id, logo_file)  # ส่งข้อมูลไปให้ teams.py
        return jsonify({'message': 'อัปเดตข้อมูลทีมสำเร็จ'}), 200
    except Exception as e:
        return jsonify({'error': 'เกิดข้อผิดพลาดในการอัปเดตทีม', 'details': str(e)}), 500

# Endpoint สำหรับลบทีม
@app.route('/api/teams/<int:team_id>', methods=['DELETE'])
def delete_team_api(team_id):
    try:
        delete_team(team_id)  # ส่งข้อมูลไปให้ teams.py
        return jsonify({'message': 'ลบทีมสำเร็จ'}), 200
    except Exception as e:
        return jsonify({'error': 'เกิดข้อผิดพลาดในการลบทีม', 'details': str(e)}), 500

# Endpoint สำหรับดึงข้อมูลเซียนบอลทั้งหมด
@app.route('/api/experts', methods=['GET'])
def get_experts():
    experts = get_all_experts()  # เรียกใช้ฟังก์ชันจาก experts.py
    return jsonify(experts), 200  # ส่งข้อมูลในรูปแบบ JSON

# Endpoint สำหรับดึงข้อมูลเซียนบอลตาม ID
@app.route('/api/experts/<int:expert_id>', methods=['GET'])
def get_expert(expert_id):
    expert = get_expert_by_id(expert_id)  # เรียกใช้ฟังก์ชันจาก experts.py
    return jsonify(expert) if expert else ('Expert not found', 404)

# Endpoint สำหรับเพิ่มเซียนบอลใหม่
@app.route('/api/experts', methods=['POST'])
def create_expert_api():
    name = request.form.get('name')  # รับข้อมูลชื่อจากฟอร์ม
    file = request.files.get('file')  # รับไฟล์รูปจากฟอร์ม

    # เรียกใช้ฟังก์ชันจาก experts.py เพื่อเพิ่มข้อมูลเซียนบอลใหม่
    if file:
        image_url = save_image(file)  # ฟังก์ชันการจัดการไฟล์รูปภาพ (ย้ายไป experts.py)
    else:
        image_url = None

    create_expert(name, image_url)  # เรียกใช้ฟังก์ชันจาก experts.py เพื่อเพิ่มข้อมูล
    return jsonify({'message': 'Expert created successfully'}), 201  # ตอบกลับเมื่อสำเร็จ

# Endpoint สำหรับอัปเดตข้อมูลเซียนบอล
@app.route('/api/experts/<int:expert_id>', methods=['PUT'])
def update_expert_api(expert_id):
    name = request.form.get('name')  # รับชื่อจากฟอร์ม
    file = request.files.get('file')  # รับไฟล์รูปจากฟอร์ม

    # เรียกใช้ฟังก์ชันจาก experts.py เพื่ออัปเดตข้อมูล
    if file:
        image_url = save_image(file)  # ฟังก์ชันการจัดการไฟล์รูปภาพ (ย้ายไป experts.py)
    else:
        image_url = None

    update_expert(expert_id, name, image_url)  # เรียกใช้ฟังก์ชันจาก experts.py เพื่ออัปเดตข้อมูล
    return jsonify({'message': 'Expert updated successfully'}), 200  # ตอบกลับเมื่อสำเร็จ

# Endpoint สำหรับลบข้อมูลเซียนบอล
@app.route('/api/experts/<int:expert_id>', methods=['DELETE'])
def delete_expert_api(expert_id):
    delete_expert(expert_id)  # เรียกใช้ฟังก์ชันจาก experts.py เพื่อลบข้อมูล
    return jsonify({'message': 'Expert deleted successfully'}), 200  # ตอบกลับเมื่อสำเร็จ

def save_image(file):
    """ฟังก์ชันช่วยในการจัดการไฟล์รูปภาพ"""
    from werkzeug.utils import secure_filename
    import os

    UPLOAD_FOLDER = 'static/uploads/img_experts'
    if not os.path.exists(UPLOAD_FOLDER):
        os.makedirs(UPLOAD_FOLDER)

    filename = secure_filename(file.filename)
    file_path = os.path.join(UPLOAD_FOLDER, filename)
    file.save(file_path)
    return f"{UPLOAD_FOLDER}/{filename}"


# เส้นทางสำหรับดึงข้อมูลเซียนทั้งหมด
@app.route('/api/community_expert', methods=['GET'])
def api_get_all_community_expert():
    experts = get_all_community_expert()
    return jsonify(experts)

@app.route('/api/community_expert', methods=['POST'])
def api_add_community_expert():
    try:
        data = request.form  # รับข้อมูลที่เป็นฟอร์ม
        file = request.files.get('image')  # รับไฟล์ที่แนบมา (รูปภาพ)

        result = add_community_expert(data, file)  # เรียกใช้งาน add_expert ใน community_experts.py
        return jsonify(result), 201

    except Exception as e:
        print("Error in api_add_expert:", e)
        return jsonify({"error": str(e)}), 500


# เส้นทางสำหรับการอัปเดตข้อมูลเซียน
@app.route('/api/community_expert/<int:expert_id>', methods=['PUT'])
def api_update_community_expert(expert_id):
    try:
        data = request.form
        file = request.files.get('image')
        response = update_community_expert(expert_id, data, file)
        return jsonify(response), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# เส้นทางสำหรับการลบข้อมูลเซียน
@app.route('/api/community_expert/<int:expert_id>', methods=['DELETE'])
def api_delete_community_expert(expert_id):
    try:
        response = delete_community_expert(expert_id)
        return jsonify(response), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
    

def serialize_timedelta(obj):
    if isinstance(obj, timedelta):
        return obj.total_seconds()
    raise TypeError("Type not serializable")


# API: ดึงข้อมูล Matches
@app.route('/api/matches', methods=['GET'])
def get_matches():
    try:
        limit = request.args.get('limit', None)
        if limit:
            limit = int(limit)
        matches = fetch_all_matches(limit=limit)
        return jsonify({'status': 'success', 'data': matches}), 200
    except ValueError:
        return jsonify({'status': 'error', 'message': 'Invalid limit value'}), 400
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500


# API: เพิ่ม Matches พร้อม Predictions
@app.route('/api/matches', methods=['POST'])
def add_matches():
    try:
        data = request.json
        if not data or 'matches' not in data:
            abort(400, 'Invalid request: missing matches data')

        print('Received data:', data)  # Debug ข้อมูลที่ส่งมาจาก Frontend

        add_matches_with_predictions(data)

        return jsonify({'status': 'success'}), 201
    except Exception as e:
        print('Error in add_matches:', str(e))  # Debug ข้อผิดพลาด
        return jsonify({'status': 'error', 'message': str(e)}), 500



# API: อัปเดต Match
@app.route('/api/matches/<int:match_id>', methods=['PUT'])
def update_match_endpoint(match_id):
    try:
        match_data = request.json
        if not match_data:
            abort(400, 'Invalid request: missing match data')
        update_match(match_id, match_data)
        return jsonify({'status': 'success'}), 200
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500


# API: ลบ Match
@app.route('/api/matches/<int:match_id>', methods=['DELETE'])
def delete_match_endpoint(match_id):
    try:
        delete_match(match_id)
        return jsonify({'status': 'success'}), 200
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500


# API: อัปเดต Prediction
@app.route('/api/predictions/<int:prediction_id>', methods=['PUT'])
def update_prediction_endpoint(prediction_id):
    try:
        prediction_data = request.json
        print(f"Updating prediction ID: {prediction_id} with data: {prediction_data}")
        update_prediction(prediction_id, prediction_data)
        return jsonify({'status': 'success'}), 200
    except Exception as e:
        print(f"Error updating prediction: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/api/predictions', methods=['POST'])
def add_prediction_endpoint():
    try:
        prediction_data = request.json
        add_predictions(prediction_data['match_id'], [prediction_data])
        return jsonify({'status': 'success'}), 201
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500



# API: ลบ Prediction
@app.route('/api/predictions/<int:prediction_id>', methods=['DELETE'])
def delete_prediction_endpoint(prediction_id):
    try:
        # เรียกใช้ฟังก์ชันลบ Prediction
        delete_prediction(prediction_id)
        return jsonify({'status': 'success', 'message': 'Prediction deleted successfully'}), 200
    except ValueError as ve:
        # หาก Prediction ไม่พบ
        return jsonify({'status': 'error', 'message': str(ve)}), 404
    except Exception as e:
        # จัดการข้อผิดพลาดทั่วไป
        return jsonify({'status': 'error', 'message': f'Unexpected error: {str(e)}'}), 500



if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
