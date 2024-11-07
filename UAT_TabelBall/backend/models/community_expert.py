from config import get_db_connection
import os
from werkzeug.utils import secure_filename
import json

UPLOAD_FOLDER = 'static/uploads/img_community_expert'

# ตรวจสอบและสร้างโฟลเดอร์ UPLOAD_FOLDER หากไม่มี
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

def get_all_experts():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM community_expert")
    experts = cursor.fetchall()
    conn.close()
    return experts

def add_expert(data, file):
    try:
        # รับค่า `expert_name` และแปลงเป็น `name` ให้ตรงกับฟิลด์ในฐานข้อมูล
        name = data.get('expert_name', '').strip()
        stat_percentage = data.get('stat_percentage', 0)
        match_detail = data.get('match_detail', '').strip()
        betting_tip = data.get('betting_tip', '').strip()

        if not name:
            raise ValueError("Name is required")

        # จัดการการเลือกครั้งการทำนาย (pick rounds) และแปลงเป็น JSON string
        pick_rounds = {f'round{i}': data.get(f'round{i}', 'ไม่ทราบ') for i in range(1, 11)}
        pick_rounds_json = json.dumps(pick_rounds)  # แปลง dict เป็น JSON string

        # จัดการการอัปโหลดรูปภาพ
        image_url = None
        if file and file.filename != '':
            filename = secure_filename(file.filename)
            file_path = os.path.join(UPLOAD_FOLDER, filename)
            file.save(file_path)
            image_url = file_path

        # เชื่อมต่อกับฐานข้อมูลและเพิ่มข้อมูล
        conn = get_db_connection()
        cursor = conn.cursor()
        sql = """
            INSERT INTO community_expert (name, pick_rounds, stat_percentage, match_detail, betting_tip, image_url)
            VALUES (%s, %s, %s, %s, %s, %s)
        """
        cursor.execute(sql, (
            name,
            pick_rounds_json,  # ใช้ JSON string สำหรับ pick_rounds
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

def update_expert(expert_id, data, file):
    try:
        # รับค่า `expert_name` และแปลงเป็น `name` ให้ตรงกับฟิลด์ในฐานข้อมูล
        name = data.get('expert_name', '').strip()
        stat_percentage = data.get('stat_percentage', 0)
        match_detail = data.get('match_detail', '').strip()
        betting_tip = data.get('betting_tip', '').strip()

        # จัดการการเลือกครั้งการทำนาย (pick rounds) และแปลงเป็น JSON string
        pick_rounds = {f'round{i}': data.get(f'round{i}', 'ไม่ทราบ') for i in range(1, 11)}
        pick_rounds_json = json.dumps(pick_rounds)

        # จัดการการอัปโหลดรูปภาพ
        image_url = data.get('existing_image_url')  # เก็บ URL รูปภาพเดิม
        if file and file.filename != '':
            filename = secure_filename(file.filename)
            file_path = os.path.join(UPLOAD_FOLDER, filename)
            file.save(file_path)
            image_url = file_path

        # เชื่อมต่อกับฐานข้อมูลและอัปเดตข้อมูล
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

def delete_expert(expert_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM community_expert WHERE id = %s", (expert_id,))
    conn.commit()
    conn.close()
    return {"message": "Expert deleted successfully"}
