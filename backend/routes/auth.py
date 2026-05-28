import os
import jwt
import datetime
from flask import Blueprint, jsonify, request, current_app
from database import db
from models import User
from dotenv import load_dotenv
from flask_bcrypt import generate_password_hash, check_password_hash

load_dotenv()

auth_bp = Blueprint('auth', __name__)

SECRET_KEY = os.environ.get('SECRET_KEY', 'ortizello_dev_key')

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    if not data or not data.get('username') or not data.get('password'):
        return jsonify({'error': 'Usuario y contraseña requeridos'}), 400
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'error': 'El usuario ya existe'}), 409
    password_hash = generate_password_hash(data['password']).decode('utf-8')
    user = User(username=data['username'], password_hash=password_hash)
    db.session.add(user)
    db.session.commit()
    return jsonify({'message': 'Usuario creado exitosamente'}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data or not data.get('username') or not data.get('password'):
        return jsonify({'error': 'Usuario y contraseña requeridos'}), 400
    user = User.query.filter_by(username=data['username']).first()
    if not user or not check_password_hash(user.password_hash, data['password']):
        return jsonify({'error': 'Credenciales incorrectas'}), 401
    token = jwt.encode({
        'user_id': user.id,
        'username': user.username,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
    }, SECRET_KEY, algorithm='HS256')
    return jsonify({'token': token, 'username': user.username}), 200