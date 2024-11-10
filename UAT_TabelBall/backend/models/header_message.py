from config import get_db_connection
import os
from werkzeug.utils import secure_filename
from flask import jsonify, request
from datetime import datetime

# ตั้งค่าโฟลเดอร์อัปโหลดรูปภาพ
UPLOAD_FOLDER = 'static/uploads/img_header_message'

# ตรวจสอบและสร้างโฟลเดอร์อัปโหลดหากยังไม่มี
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

def get_header_message():
    """ฟังก์ชันสำหรับดึงข้อมูล header message"""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT description, link_url, image_url, updated_at FROM header_messages LIMIT 1")
    data = cursor.fetchone()
    conn.close()

    if data:
        return jsonify(data), 200
    else:
        return jsonify({'message': 'No record found'}), 404

def update_header_message():
    """ฟังก์ชันสำหรับอัปเดต header message"""
    description = request.form.get('description')
    link_url = request.form.get('link_url')
    image = request.files.get('image')

    conn = get_db_connection()
    cursor = conn.cursor()

    # ตรวจสอบว่ามีข้อมูลอยู่ในฐานข้อมูลหรือไม่
    cursor.execute("SELECT id, image_url FROM header_messages LIMIT 1")
    record = cursor.fetchone()

    if record:
        # อัปเดตข้อมูลข้อความและลิงก์
        cursor.execute("""
            UPDATE header_messages 
            SET description=%s, link_url=%s, updated_at=NOW() 
            WHERE id=%s
        """, (description, link_url, record[0]))

        # อัปเดตรูปภาพหากมีการอัปโหลด
        if image:
            # ลบรูปภาพเก่า
            if record[1]:
                old_image_path = os.path.join(UPLOAD_FOLDER, record[1])
                if os.path.exists(old_image_path):
                    os.remove(old_image_path)  # ลบรูปภาพเก่าที่มีอยู่

            # บันทึกรูปภาพใหม่โดยไม่ใส่วันที่เวลา
            image_filename = secure_filename(image.filename)
            image.save(os.path.join(UPLOAD_FOLDER, image_filename))
            cursor.execute("UPDATE header_messages SET image_url=%s WHERE id=%s", (image_filename, record[0]))

    else:
        # เพิ่มข้อมูลใหม่ในฐานข้อมูล
        image_filename = None
        if image:
            image_filename = secure_filename(image.filename)
            image.save(os.path.join(UPLOAD_FOLDER, image_filename))

        cursor.execute("""
            INSERT INTO header_messages (description, link_url, image_url, updated_at) 
            VALUES (%s, %s, %s, NOW())
        """, (description, link_url, image_filename))

    conn.commit()
    conn.close()
    return jsonify({'message': 'Record updated successfully.'}), 200
