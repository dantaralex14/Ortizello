import os
import jwt
from flask import Blueprint, jsonify, request
from database import db
from models import Column, Board
from dotenv import load_dotenv

load_dotenv()

columns_bp = Blueprint('columns', __name__)
SECRET_KEY = os.environ.get('SECRET_KEY', 'ortizello_dev_key')

def get_user(request):
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    if not token:
        return None
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
    except:
        return None

@columns_bp.route('/', methods=['POST'])
def create_column():
    user = get_user(request)
    if not user:
        return jsonify({'error': 'No autorizado'}), 401
    data = request.get_json()
    board = Board.query.filter_by(id=data.get('board_id'), user_id=user['user_id']).first()
    if not board:
        return jsonify({'error': 'Tablero no encontrado'}), 404
    position = len(board.columns)
    col = Column(title=data['title'], position=position, board_id=board.id)
    db.session.add(col)
    db.session.commit()
    return jsonify({'id': col.id, 'title': col.title, 'position': col.position, 'cards': []}), 201

@columns_bp.route('/<int:col_id>', methods=['DELETE'])
def delete_column(col_id):
    user = get_user(request)
    if not user:
        return jsonify({'error': 'No autorizado'}), 401
    col = Column.query.get_or_404(col_id)
    board = Board.query.filter_by(id=col.board_id, user_id=user['user_id']).first()
    if not board:
        return jsonify({'error': 'No autorizado'}), 403
    db.session.delete(col)
    db.session.commit()
    return jsonify({'message': 'Columna eliminada'}), 200