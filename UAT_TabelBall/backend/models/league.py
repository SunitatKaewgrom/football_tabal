# league.py
import os
from datetime import datetime
from werkzeug.utils import secure_filename
from config import get_db_connection

UPLOAD_FOLDER = 'static/uploads/img_league'  # โฟลเดอร์สำหรับเก็บรูปภาพลีก
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}  # ประเภทไฟล์ที่อนุญาตให้อัปโหลด

# ฟังก์ชันตรวจสอบประเภทไฟล์
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# ฟังก์ชันดึงข้อมูลลีกทั้งหมด
def get_all_leagues():
    connection = get_db_connection()
    cursor = connection.cursor()
    cursor.execute("SELECT * FROM leagues")
    leagues = cursor.fetchall()
    cursor.close()
    connection.close()
    return [{"id": league[0], "name": league[1], "logo_url": league[2], "created_at": league[3], "updated_at": league[4]} for league in leagues]

# ฟังก์ชันดึงข้อมูลลีกตาม ID
def get_league_by_id(league_id):
    connection = get_db_connection()
    cursor = connection.cursor()
    cursor.execute("SELECT * FROM leagues WHERE id = %s", (league_id,))
    league = cursor.fetchone()
    cursor.close()
    connection.close()
    if league:
        return {
            "id": league[0],
            "name": league[1],
            "logo_url": league[2],
            "created_at": league[3],
            "updated_at": league[4]
        }
    return None

# ฟังก์ชันสร้างลีกใหม่
def create_league(name, logo_file):
    # ตรวจสอบว่าไฟล์มีการอัปโหลดและเป็นไฟล์ที่อนุญาต
    if logo_file and allowed_file(logo_file.filename):
        filename = secure_filename(logo_file.filename)
        file_path = os.path.join(UPLOAD_FOLDER, filename)

        # ตรวจสอบและสร้างโฟลเดอร์ UPLOAD_FOLDER หากไม่มี
        if not os.path.exists(UPLOAD_FOLDER):
            os.makedirs(UPLOAD_FOLDER)

        logo_file.save(file_path)  # บันทึกไฟล์ลงในโฟลเดอร์
        logo_url = file_path  # เก็บ path ของรูปในฐานข้อมูล
    else:
        logo_url = None  # ถ้าไม่มีไฟล์หรือไฟล์ไม่ถูกต้อง

    # บันทึกข้อมูลลีกลงในฐานข้อมูล
    connection = get_db_connection()
    cursor = connection.cursor()
    cursor.execute(
        "INSERT INTO leagues (name, logo_url, created_at, updated_at) VALUES (%s, %s, %s, %s)",
        (name, logo_url, datetime.utcnow(), datetime.utcnow())
    )
    connection.commit()
    new_league_id = cursor.lastrowid
    cursor.close()
    connection.close()
    return get_league_by_id(new_league_id)

# ฟังก์ชันอัปเดตข้อมูลลีก
def update_league(league_id, name=None, logo_file=None):
    connection = get_db_connection()
    cursor = connection.cursor()
    
    if logo_file and allowed_file(logo_file.filename):
        filename = secure_filename(logo_file.filename)
        file_path = os.path.join(UPLOAD_FOLDER, filename)
        if not os.path.exists(UPLOAD_FOLDER):
            os.makedirs(UPLOAD_FOLDER)
        logo_file.save(file_path)
        logo_url = file_path
    else:
        logo_url = None

    if name and logo_url:
        cursor.execute("UPDATE leagues SET name = %s, logo_url = %s, updated_at = %s WHERE id = %s", (name, logo_url, datetime.utcnow(), league_id))
    elif name:
        cursor.execute("UPDATE leagues SET name = %s, updated_at = %s WHERE id = %s", (name, datetime.utcnow(), league_id))
    elif logo_url:
        cursor.execute("UPDATE leagues SET logo_url = %s, updated_at = %s WHERE id = %s", (logo_url, datetime.utcnow(), league_id))

    connection.commit()
    cursor.close()
    connection.close()
    return get_league_by_id(league_id)

# ฟังก์ชันลบลีก
def delete_league(league_id):
    connection = get_db_connection()
    cursor = connection.cursor()
    cursor.execute("DELETE FROM leagues WHERE id = %s", (league_id,))
    connection.commit()
    cursor.close()
    connection.close()
    return True
