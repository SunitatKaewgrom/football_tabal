from config import get_db_connection
import os
from werkzeug.utils import secure_filename

# ตั้งค่าโฟลเดอร์สำหรับการอัปโหลดไฟล์รูปภาพของทีม
UPLOAD_FOLDER = 'static/uploads/img_team'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def get_all_teams():
    """ดึงข้อมูลทั้งหมดของทีมจากฐานข้อมูล"""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT teams.id, teams.name AS team_name, leagues.name AS league_name, teams.logo_url
        FROM teams
        LEFT JOIN leagues ON teams.league_id = leagues.id
    """)
    teams = cursor.fetchall()
    conn.close()
    return teams

def create_team(name, league_id, logo_file=None):
    """เพิ่มข้อมูลทีมใหม่ลงในฐานข้อมูล"""
    conn = get_db_connection()
    cursor = conn.cursor()

    logo_url = None
    if logo_file:
        filename = secure_filename(logo_file.filename)
        logo_path = os.path.join(UPLOAD_FOLDER, filename)
        logo_file.save(logo_path)
        logo_url = f"{UPLOAD_FOLDER}/{filename}"

    cursor.execute("""
        INSERT INTO teams (name, league_id, logo_url)
        VALUES (%s, %s, %s)
    """, (name, league_id, logo_url))
    conn.commit()
    conn.close()

def update_team(team_id, name, league_id, logo_file=None):
    """อัปเดตข้อมูลทีมที่มีอยู่"""
    conn = get_db_connection()
    cursor = conn.cursor()

    if logo_file:
        filename = secure_filename(logo_file.filename)
        logo_path = os.path.join(UPLOAD_FOLDER, filename)
        logo_file.save(logo_path)
        logo_url = f"{UPLOAD_FOLDER}/{filename}"
        cursor.execute("""
            UPDATE teams SET name = %s, league_id = %s, logo_url = %s WHERE id = %s
        """, (name, league_id, logo_url, team_id))
    else:
        cursor.execute("""
            UPDATE teams SET name = %s, league_id = %s WHERE id = %s
        """, (name, league_id, team_id))

    conn.commit()
    conn.close()

def delete_team(team_id):
    """ลบทีมจากฐานข้อมูล"""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM teams WHERE id = %s", (team_id,))
    conn.commit()
    conn.close()
