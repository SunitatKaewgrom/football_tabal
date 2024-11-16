from config import get_db_connection

# ฟังก์ชันดึงข้อมูล Matches ทั้งหมด
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

# ฟังก์ชันเพิ่ม Match
def add_match_to_db(match_data):
    connection = get_db_connection()
    cursor = connection.cursor()
    try:
        query = """
            INSERT INTO matches (match_status, league_id, home_team_id, away_team_id, date, time, odds, home_score, away_score, team_advantage)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s);
        """
        cursor.execute(query, (
            match_data['match_status'],
            match_data['league_id'],
            match_data['home_team_id'],
            match_data['away_team_id'],
            match_data['date'],
            match_data['time'],
            match_data.get('odds', None),
            match_data.get('home_score', 0),
            match_data.get('away_score', 0),
            match_data.get('team_advantage', None)
        ))
        connection.commit()
        return cursor.lastrowid  # ส่งคืน match_id ที่เพิ่งเพิ่ม
    finally:
        cursor.close()
        connection.close()

# ฟังก์ชันดึงข้อมูล Predictions ทั้งหมด
def fetch_all_predictions():
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)
    try:
        query = """
            SELECT p.id, p.match_id, p.expert_id, e.name AS expert_name, 
                   p.analysis, p.link, p.prediction
            FROM predictions p
            JOIN experts e ON p.expert_id = e.id
            ORDER BY p.match_id;
        """
        cursor.execute(query)
        return cursor.fetchall()
    finally:
        cursor.close()
        connection.close()

# ฟังก์ชันเพิ่ม Prediction
def add_prediction_to_db(prediction_data):
    connection = get_db_connection()
    cursor = connection.cursor()
    try:
        query = """
            INSERT INTO predictions (match_id, expert_id, analysis, link, prediction)
            VALUES (%s, %s, %s, %s, %s);
        """
        cursor.execute(query, (
            prediction_data['match_id'],
            prediction_data['expert_id'],
            prediction_data.get('analysis', None),
            prediction_data.get('link', None),
            prediction_data['prediction']
        ))
        connection.commit()
    finally:
        cursor.close()
        connection.close()
