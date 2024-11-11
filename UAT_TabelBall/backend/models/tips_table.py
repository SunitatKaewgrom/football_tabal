from config import get_db_connection
import os
from werkzeug.utils import secure_filename

# กำหนดโฟลเดอร์สำหรับเก็บรูปภาพที่อัปโหลด
UPLOAD_FOLDER = 'static/uploads/img_tips_table'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# ฟังก์ชันสำหรับดึงข้อมูลการทายผลทั้งหมด
def get_all_tips():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT tt.id, tt.home_team, tt.away_team, tt.match_date, tt.home_team_result, tt.away_team_result, tt.betting_tip 
        FROM tips_table tt
    """)
    tips = cursor.fetchall()
    conn.close()
    return tips

# ฟังก์ชันสำหรับดึงข้อมูลการทายผลตาม ID
def get_tips_by_id(tip_id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM tips_table WHERE id = %s", (tip_id,))
    tip = cursor.fetchone()
    conn.close()
    return tip

# ฟังก์ชันสำหรับเพิ่มข้อมูลการทายผล
def add_prediction(expert_id, tips_table_id, prediction):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO expert_predictions (expert_id, tips_table_id, prediction)
        VALUES (%s, %s, %s)
    """, (expert_id, tips_table_id, prediction))
    conn.commit()
    conn.close()

# ฟังก์ชันสำหรับดึงข้อมูลทายผลของเซียน
def get_predictions_by_expert(expert_id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT ep.id, tt.home_team, tt.away_team, ep.prediction 
        FROM expert_predictions ep
        JOIN tips_table tt ON ep.tips_table_id = tt.id
        WHERE ep.expert_id = %s
    """, (expert_id,))
    predictions = cursor.fetchall()
    conn.close()
    return predictions

# ฟังก์ชันสำหรับบันทึกข้อมูลการทายผล
def save_tips_file(file):
    if file:
        filename = secure_filename(file.filename)
        file_path = os.path.join(UPLOAD_FOLDER, filename)
        file.save(file_path)
        return file_path
    return None

