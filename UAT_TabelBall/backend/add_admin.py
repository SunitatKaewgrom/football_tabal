import mysql.connector
from bcrypt import hashpw, gensalt

# ฟังก์ชันสำหรับเพิ่มผู้ใช้ admin
def add_admin(username, password):
    # เข้ารหัสรหัสผ่านด้วย bcrypt
    hashed_password = hashpw(password.encode('utf-8'), gensalt())

    # สร้างการเชื่อมต่อฐานข้อมูล
    connection = mysql.connector.connect(
        host='localhost',
        user='root',
        password='',
        database='SYS_Football_DB'
    )
    cursor = connection.cursor()

    try:
        # เพิ่มข้อมูลผู้ใช้ admin ใหม่
        cursor.execute("INSERT INTO admins (username, password) VALUES (%s, %s)", (username, hashed_password))
        connection.commit()
        print("เพิ่มผู้ใช้ admin สำเร็จ")
    except mysql.connector.Error as err:
        print(f"เกิดข้อผิดพลาด: {err}")
    finally:
        # ปิดการเชื่อมต่อ
        cursor.close()
        connection.close()

# เรียกใช้ฟังก์ชัน add_admin โดยระบุ username และ password
if __name__ == '__main__':
    add_admin('admin', '123456')
