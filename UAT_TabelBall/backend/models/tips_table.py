from config import get_db_connection

# ฟังก์ชันดึงข้อมูล matches ทั้งหมด
def fetch_all_matches():
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)
    try:
        query = """
            SELECT m.id, m.match_status, m.league_id, l.name AS league_name, 
                   m.home_team_id, t1.team_name AS home_team_name, 
                   m.away_team_id, t2.team_name AS away_team_name, 
                   m.date, m.time, m.odds, m.home_score, m.away_score, m.team_advantage
            FROM matches m
            JOIN leagues l ON m.league_id = l.id
            JOIN teams t1 ON m.home_team_id = t1.id
            JOIN teams t2 ON m.away_team_id = t2.id
            ORDER BY m.date, m.time;
        """
        cursor.execute(query)
        return cursor.fetchall()
    finally:
        cursor.close()
        connection.close()

# ฟังก์ชันเพิ่ม match เดียวลงในฐานข้อมูล
def add_match(match_data):
    connection = get_db_connection()
    cursor = connection.cursor()
    try:
        query = """
            INSERT INTO matches (match_status, league_id, home_team_id, away_team_id, date, time, odds, home_score, away_score, team_advantage)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s);
        """
        # Execute SQL สำหรับการเพิ่ม match
        cursor.execute(query, (
            match_data['matchStatus'],
            match_data['league'],
            match_data['homeTeam'],
            match_data['awayTeam'],
            match_data['date'],
            match_data['time'],
            match_data.get('odds', None),
            match_data.get('homeScore', 0),
            match_data.get('awayScore', 0),
            match_data.get('teamAdvantage', None)
        ))
        connection.commit()

        # ดึงค่า match_id ที่ถูกเพิ่มล่าสุด
        cursor.execute("SELECT LAST_INSERT_ID();")
        match_id = cursor.fetchone()[0]
        return match_id
    finally:
        cursor.close()
        connection.close()


# ฟังก์ชันเพิ่ม prediction หลายรายการสำหรับ match หนึ่งรายการ
def add_predictions(match_id, predictions):
    connection = get_db_connection()
    cursor = connection.cursor()
    try:
        query = """
            INSERT INTO predictions (match_id, expert_id, analysis, link, prediction)
            VALUES (%s, %s, %s, %s, %s);
        """
        for prediction in predictions:
            cursor.execute(query, (
                match_id,
                prediction['expert_id'],
                prediction.get('analysis', None),
                prediction.get('link', None),
                prediction['prediction']
            ))
        connection.commit()
    finally:
        cursor.close()
        connection.close()

# ฟังก์ชันเพิ่ม matches พร้อม predictions หลายรายการ
def add_matches_with_predictions(data):
    try:
        for match in data['matches']:
            # เพิ่ม match ใหม่
            match_id = add_match(match['matchDetails'])
            # เพิ่ม predictions ที่เกี่ยวข้องกับ match ที่สร้าง
            add_predictions(match_id, match['predictions'])
    except Exception as e:
        raise Exception(f"Error adding matches with predictions: {str(e)}")
