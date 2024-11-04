from config import get_db_connection

# ฟังก์ชันสำหรับดึงข้อมูลทีมทั้งหมด
def get_all_teams():
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

# ฟังก์ชันสำหรับดึงข้อมูลทีมตาม ID
def get_team_by_id(team_id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM teams WHERE id = %s", (team_id,))
    team = cursor.fetchone()
    conn.close()
    return team

# ฟังก์ชันสำหรับสร้างทีมใหม่
def create_team(name, league_id, logo_url=None):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO teams (name, league_id, logo_url)
        VALUES (%s, %s, %s)
    """, (name, league_id, logo_url))
    conn.commit()
    conn.close()

# ฟังก์ชันสำหรับอัปเดตข้อมูลทีม
def update_team(team_id, name, league_id, logo_url=None):
    conn = get_db_connection()
    cursor = conn.cursor()
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

# ฟังก์ชันสำหรับลบทีมตาม ID
def delete_team(team_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM teams WHERE id = %s", (team_id,))
    conn.commit()
    conn.close()
