from config import get_db_connection
from datetime import timedelta, datetime, date


def serialize_data(data):
    """
    ฟังก์ชันช่วยแปลงชนิดข้อมูลเพื่อให้ JSON serializable
    """
    if isinstance(data, timedelta):
        return str(data)  # แปลง timedelta เป็น string เช่น '1:00:00'
    elif isinstance(data, datetime):
        return data.isoformat()  # แปลง datetime เป็น ISO 8601 string
    elif isinstance(data, date):
        return data.isoformat()  # แปลง date เป็น ISO 8601 string
    return data


def fetch_all_matches(limit=None):
    """
    ฟังก์ชันดึงข้อมูล matches ทั้งหมด พร้อมข้อมูล predictions ที่เกี่ยวข้อง
    """
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)
    try:
        # ดึงข้อมูล matches พร้อมข้อมูล predictions
        query_matches = """
            SELECT m.id AS match_id, 
                   m.match_status, 
                   m.league_id, 
                   l.name AS league_name, 
                   m.home_team_id, 
                   t1.name AS home_team_name, 
                   m.away_team_id, 
                   t2.name AS away_team_name, 
                   m.date, 
                   TIME_FORMAT(m.time, '%H:%i') AS time, 
                   m.odds, 
                   m.home_score, 
                   m.away_score, 
                   m.team_advantage
            FROM matches m
            JOIN leagues l ON m.league_id = l.id
            JOIN teams t1 ON m.home_team_id = t1.id
            JOIN teams t2 ON m.away_team_id = t2.id
            ORDER BY m.date DESC, m.time DESC
        """
        if limit:
            query_matches += " LIMIT %s"
            cursor.execute(query_matches, (limit,))
        else:
            cursor.execute(query_matches)

        matches = cursor.fetchall()

        # ดึงข้อมูล predictions ที่เกี่ยวข้องกับ matches
        match_ids = [match['match_id'] for match in matches]
        if match_ids:
            query_predictions = """
                SELECT p.match_id, 
                       p.expert_id, 
                       e.name AS expert_name, 
                       p.analysis, 
                       p.link, 
                       p.prediction
                FROM predictions p
                JOIN experts e ON p.expert_id = e.id
                WHERE p.match_id IN (%s)
            """ % ','.join(['%s'] * len(match_ids))
            cursor.execute(query_predictions, match_ids)
            predictions = cursor.fetchall()
        else:
            predictions = []

        # จัดกลุ่ม predictions ตาม match_id
        predictions_by_match = {}
        for prediction in predictions:
            match_id = prediction['match_id']
            if match_id not in predictions_by_match:
                predictions_by_match[match_id] = []
            predictions_by_match[match_id].append(prediction)

        # ผนวก predictions เข้าไปใน matches
        for match in matches:
            match_id = match['match_id']
            match['predictions'] = predictions_by_match.get(match_id, [])

            # แปลงชนิดข้อมูลให้ JSON serializable
            for key, value in match.items():
                match[key] = serialize_data(value)

        return matches
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
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
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
        return cursor.lastrowid
    finally:
        cursor.close()
        connection.close()

# ฟังก์ชันเพิ่ม predictions หลายรายการสำหรับ match หนึ่งรายการ
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
    for match in data['matches']:
        # เพิ่ม match และรับ match_id ที่สร้างใหม่
        match_id = add_match(match['matchDetails'])
        # เพิ่ม predictions ที่เกี่ยวข้อง
        add_predictions(match_id, match['predictions'])
