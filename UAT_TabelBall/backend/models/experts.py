from config import get_db_connection

# ฟังก์ชันสำหรับดึงข้อมูลเซียนบอลทั้งหมด
def get_all_experts():
    conn = get_db_connection()  # เชื่อมต่อฐานข้อมูล
    cursor = conn.cursor(dictionary=True)
    # ดึงข้อมูล ID, ชื่อ และ URL ของรูปภาพจากตาราง experts
    cursor.execute("SELECT id, name, image_url FROM experts")
    experts = cursor.fetchall()
    conn.close()  # ปิดการเชื่อมต่อฐานข้อมูล
    return experts  # คืนค่ารายชื่อเซียนบอลทั้งหมด

# ฟังก์ชันสำหรับดึงข้อมูลเซียนบอลตาม ID
def get_expert_by_id(expert_id):
    conn = get_db_connection()  # เชื่อมต่อฐานข้อมูล
    cursor = conn.cursor(dictionary=True)
    # ดึงข้อมูลเซียนบอลตาม ID ที่ระบุ
    cursor.execute("SELECT id, name, image_url FROM experts WHERE id = %s", (expert_id,))
    expert = cursor.fetchone()
    conn.close()  # ปิดการเชื่อมต่อฐานข้อมูล
    return expert  # คืนค่าข้อมูลเซียนบอลตาม ID ที่ระบุ

# ฟังก์ชันสำหรับเพิ่มข้อมูลเซียนบอลใหม่
def create_expert(name, image_url):
    conn = get_db_connection()  # เชื่อมต่อฐานข้อมูล
    cursor = conn.cursor()
    # เพิ่มข้อมูลเซียนบอลใหม่พร้อม URL ของรูปภาพ
    cursor.execute("INSERT INTO experts (name, image_url) VALUES (%s, %s)", (name, image_url))
    conn.commit()  # ยืนยันการบันทึกข้อมูล
    conn.close()  # ปิดการเชื่อมต่อฐานข้อมูล

# ฟังก์ชันสำหรับอัปเดตข้อมูลเซียนบอล
def update_expert(expert_id, name, image_url=None):
    conn = get_db_connection()  # เชื่อมต่อฐานข้อมูล
    cursor = conn.cursor()
    # ตรวจสอบว่ามีการส่ง URL ของรูปภาพมาหรือไม่
    if image_url:
        # อัปเดตชื่อและ URL ของรูปภาพ
        cursor.execute("UPDATE experts SET name = %s, image_url = %s WHERE id = %s", (name, image_url, expert_id))
    else:
        # อัปเดตเฉพาะชื่อ
        cursor.execute("UPDATE experts SET name = %s WHERE id = %s", (name, expert_id))
    conn.commit()  # ยืนยันการบันทึกข้อมูล
    conn.close()  # ปิดการเชื่อมต่อฐานข้อมูล

# ฟังก์ชันสำหรับลบข้อมูลเซียนบอล
def delete_expert(expert_id):
    conn = get_db_connection()  # เชื่อมต่อฐานข้อมูล
    cursor = conn.cursor()
    # ลบข้อมูลเซียนบอลตาม ID ที่ระบุ
    cursor.execute("DELETE FROM experts WHERE id = %s", (expert_id,))
    conn.commit()  # ยืนยันการลบข้อมูล
    conn.close()  # ปิดการเชื่อมต่อฐานข้อมูล
