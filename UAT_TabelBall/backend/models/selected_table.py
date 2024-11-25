from config import get_db_connection

class SelectedItemModel:
    def __init__(self, id=None, league_id=None, home_team_id=None, away_team_id=None, expert_id=None, analysis_link=None, result=None):
        self.id = id
        self.league_id = league_id
        self.home_team_id = home_team_id
        self.away_team_id = away_team_id
        self.expert_id = expert_id
        self.analysis_link = analysis_link
        self.result = result

    @staticmethod
    def fetch_all_selected_items():
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        try:
            query = """
            SELECT 
                s.id, 
                s.league_id, 
                l.name AS league_name,
                s.home_team_id, 
                ht.name AS home_team_name, 
                s.away_team_id, 
                at.name AS away_team_name, 
                s.expert_id, 
                e.name AS expert_name, 
                s.analysis_link, 
                s.result 
            FROM 
                selected_items s
            JOIN 
                leagues l ON s.league_id = l.id
            JOIN 
                teams ht ON s.home_team_id = ht.id
            JOIN 
                teams at ON s.away_team_id = at.id
            JOIN 
                experts e ON s.expert_id = e.id
            """
            cursor.execute(query)
            results = cursor.fetchall()
            return results
        finally:
            cursor.close()
            connection.close()


# เพิ่มรายการใหม่ใน selected_items
def add_selected_item(data):
    """
    เพิ่มรายการใหม่ลงในฐานข้อมูล
    """
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            query = """
                INSERT INTO selected_items (
                    league_id, home_team_id, away_team_id, expert_id, 
                    analysis_link, result
                ) VALUES (%s, %s, %s, %s, %s, %s)
            """
            cursor.execute(query, (
                data['league_id'],
                data['home_team_id'],
                data['away_team_id'],
                data['expert_id'],
                data.get('analysis_link', None),
                data.get('result', None),
            ))
            connection.commit()
            return cursor.lastrowid
    except Exception as e:
        raise Exception(f"Database error: {e}")
    finally:
        connection.close()


# อัปเดตรายการใน selected_items
def update_selected_item(item_id, data):
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            query = """
                UPDATE selected_items
                SET league_id = %s, 
                    home_team_id = %s, 
                    away_team_id = %s, 
                    expert_id = %s, 
                    analysis_link = %s, 
                    result = %s,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = %s
            """
            cursor.execute(query, (
                data['league_id'],
                data['home_team_id'],
                data['away_team_id'],
                data['expert_id'],
                data.get('analysis_link', None),
                data.get('result', None),
                item_id,
            ))
            connection.commit()
            return cursor.rowcount
    finally:
        connection.close()

# ลบรายการใน selected_items
def delete_selected_item(item_id):
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            query = "DELETE FROM selected_items WHERE id = %s"
            cursor.execute(query, (item_id,))
            connection.commit()
            return cursor.rowcount
    finally:
        connection.close()
