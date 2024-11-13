# config.py
import mysql.connector

def get_db_connection():
    connection = mysql.connector.connect(
        host='db',
        user='root',
        password='123456',
        database='SYS_Football_DB'
    )
    return connection
