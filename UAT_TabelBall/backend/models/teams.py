from flask import request, jsonify
from config import get_db_connection

# ฟังก์ชันสำหรับดึงข้อมูลทีมทั้งหมดจากฐานข้อมูล
def get_all_teams():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    # Query ดึงข้อมูลทุกทีม และรวมข้อมูลจากตาราง leagues
    cursor.execute("""
        SELECT teams.id, teams.name AS team_name, leagues.name AS league_name, teams.logo_url
        FROM teams
        LEFT JOIN leagues ON teams.league_id = leagues.id
    """)
    teams = cursor.fetchall()
    conn.close()
    return teams

# ฟังก์ชันสำหรับดึงข้อมูลทีมตาม ID
def get_team_by_id(team_id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    # Query ดึงข้อมูลทีมตาม ID ที่ระบุ
    cursor.execute("SELECT * FROM teams WHERE id = %s", (team_id,))
    team = cursor.fetchone()
    conn.close()
    return team

# ฟังก์ชันสำหรับสร้างทีมใหม่
def create_team(name, league_id, logo_url):
    conn = get_db_connection()
    cursor = conn.cursor()
    # Query สำหรับเพิ่มข้อมูลทีมใหม่
    cursor.execute("""
        INSERT INTO teams (name, league_id, logo_url)
        VALUES (%s, %s, %s)
    """, (name, league_id, logo_url))
    conn.commit()
    conn.close()


# ฟังก์ชันสำหรับอัปเดตข้อมูลทีมที่มีอยู่
def update_team(team_id, name, league_id, logo_url=None):
    conn = get_db_connection()
    cursor = conn.cursor()
    # Query อัปเดตข้อมูลทีม โดยเช็คว่ามีการเปลี่ยนรูปหรือไม่
    if logo_url:
        cursor.execute("""
            UPDATE teams SET name = %s, league_id = %s, logo_url = %s WHERE id = %s
        """, (name, league_id, logo_url, team_id))
    else:
        cursor.execute("""
            UPDATE teams SET name = %s, league_id = %s WHERE id = %s
        """, (name, league_id, team_id))
    conn.commit()
    conn.close()


# ฟังก์ชันสำหรับลบข้อมูลทีมตาม ID
def delete_team(team_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    # Query ลบข้อมูลทีมตาม ID ที่ระบุ
    cursor.execute("DELETE FROM teams WHERE id = %s", (team_id,))
    conn.commit()
    conn.close()
