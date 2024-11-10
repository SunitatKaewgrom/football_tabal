from config import get_db_connection
import os
from werkzeug.utils import secure_filename
import json

UPLOAD_FOLDER = 'static/uploads/img_community_expert'

# ตรวจสอบและสร้างโฟลเดอร์ UPLOAD_FOLDER หากไม่มี
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

def get_all_community_expert():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM community_expert")
    experts = cursor.fetchall()
    conn.close()
    return experts

def add_community_expert(data, file):
    try:
        name = data.get('name', '').strip() or data.get('expert_name', '').strip()
        stat_percentage = data.get('stat_percentage', 0)
        match_detail = data.get('match_detail', '').strip()
        betting_tip = data.get('betting_tip', '').strip()

        if not name:
            raise ValueError("Name is required")

        # แปลง pick_rounds เป็น JSON string
        pick_rounds = {f'round{i}': data.get(f'round{i}', 'ไม่ทราบผล') for i in range(1, 11)}
        pick_rounds_json = json.dumps(pick_rounds, ensure_ascii=False)

        # จัดการการอัปโหลดรูปภาพ
        image_url = None
        if file and file.filename != '':
            filename = secure_filename(file.filename)
            file_path = os.path.join(UPLOAD_FOLDER, filename)
            file.save(file_path)
            image_url = file_path

        # เพิ่มข้อมูลลงฐานข้อมูล
        conn = get_db_connection()
        cursor = conn.cursor()
        sql = """
            INSERT INTO community_expert (name, pick_rounds, stat_percentage, match_detail, betting_tip, image_url)
            VALUES (%s, %s, %s, %s, %s, %s)
        """
        cursor.execute(sql, (
            name,
            pick_rounds_json,
            stat_percentage,
            match_detail,
            betting_tip,
            image_url
        ))
        conn.commit()
        conn.close()
        return {"message": "Expert added successfully"}
    
    except Exception as e:
        print("Database insertion error:", e)
        raise e


def update_community_expert(expert_id, data, file):
    try:
        name = data.get('expert_name', '').strip()
        stat_percentage = data.get('stat_percentage', 0)
        match_detail = data.get('match_detail', '').strip()
        betting_tip = data.get('betting_tip', '').strip()

        pick_rounds = {f'round{i}': data.get(f'round{i}', 'ไม่ทราบ') for i in range(1, 11)}
        pick_rounds_json = json.dumps(pick_rounds)

        image_url = data.get('existing_image_url')  # ใช้ URL รูปภาพเดิมถ้าไม่มีการอัปโหลดใหม่
        if file and file.filename != '':
            filename = secure_filename(file.filename)
            file_path = os.path.join(UPLOAD_FOLDER, filename)
            file.save(file_path)
            image_url = os.path.join(UPLOAD_FOLDER, filename)

        conn = get_db_connection()
        cursor = conn.cursor()
        sql = """
            UPDATE community_expert
            SET name=%s, pick_rounds=%s, stat_percentage=%s, match_detail=%s, betting_tip=%s, image_url=%s
            WHERE id=%s
        """
        cursor.execute(sql, (
            name,
            pick_rounds_json,
            stat_percentage,
            match_detail,
            betting_tip,
            image_url,
            expert_id
        ))
        conn.commit()
        conn.close()
        return {"message": "Expert updated successfully"}

    except Exception as e:
        print("Database update error:", e)
        raise e


def delete_community_expert(expert_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM community_expert WHERE id = %s", (expert_id,))
        conn.commit()
        conn.close()
        return {"message": "Expert deleted successfully"}
    except Exception as e:
        print("Error deleting expert:", e)
        raise e
