# routes/user_routes.py
from flask import Blueprint, jsonify, request
from config import get_db_connection

user_routes = Blueprint('user_routes', __name__)

@user_routes.route('/', methods=['GET'])
def get_all_users():
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)
    cursor.execute("SELECT * FROM users")
    users = cursor.fetchall()
    cursor.close()
    connection.close()
    return jsonify(users)

@user_routes.route('/', methods=['POST'])
def create_user():
    data = request.json
    connection = get_db_connection()
    cursor = connection.cursor()
    cursor.execute("INSERT INTO users (name, email) VALUES (%s, %s)", (data['name'], data['email']))
    connection.commit()
    cursor.close()
    connection.close()
    return jsonify({'message': 'User created successfully!'}), 201
