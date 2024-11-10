from config import get_db_connection
import os
from werkzeug.utils import secure_filename

# กำหนดโฟลเดอร์สำหรับเก็บรูปภาพที่อัปโหลด
UPLOAD_FOLDER = 'static/uploads/img_experts'

# ตรวจสอบและสร้างโฟลเดอร์หากยังไม่มี
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

def get_all_experts():
    """ดึงข้อมูลเซียนบอลทั้งหมด"""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT id, name, image_url FROM experts")
    experts = cursor.fetchall()
    conn.close()
    return experts

def get_expert_by_id(expert_id):
    """ดึงข้อมูลเซียนบอลตาม ID"""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT id, name, image_url FROM experts WHERE id = %s", (expert_id,))
    expert = cursor.fetchone()
    conn.close()
    return expert

def create_expert(name, image_url):
    """เพิ่มข้อมูลเซียนบอลใหม่"""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("INSERT INTO experts (name, image_url) VALUES (%s, %s)", (name, image_url))
    conn.commit()
    conn.close()

def update_expert(expert_id, name, image_url=None):
    """อัปเดตข้อมูลเซียนบอล"""
    conn = get_db_connection()
    cursor = conn.cursor()
    if image_url:
        cursor.execute("UPDATE experts SET name = %s, image_url = %s WHERE id = %s", (name, image_url, expert_id))
    else:
        cursor.execute("UPDATE experts SET name = %s WHERE id = %s", (name, expert_id))
    conn.commit()
    conn.close()

def delete_expert(expert_id):
    """ลบข้อมูลเซียนบอล"""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM experts WHERE id = %s", (expert_id,))
    conn.commit()
    conn.close()
