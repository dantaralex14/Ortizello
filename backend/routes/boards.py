import os
import jwt
from flask import Blueprint, jsonify, request
from database import db
from models import Board, Column
from dotenv import load_dotenv

load_dotenv()

boards_bp = Blueprint('boards', __name__)
SECRET_KEY = os.environ.get('SECRET_KEY', 'ortizello_dev_key')

def get_user(request):
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    if not token:
        return None
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
    except:
        return None

@boards_bp.route('/', methods=['GET'])
def get_boards():
    user = get_user(request)
    if not user:
        return jsonify({'error': 'No autorizado'}), 401
    boards = Board.query.filter_by(user_id=user['user_id']).order_by(Board.created_at.desc()).all()
    return jsonify([{
        'id': b.id, 'title': b.title,
        'color': b.color, 'created_at': b.created_at.isoformat()
    } for b in boards])

@boards_bp.route('/', methods=['POST'])
def create_board():
    user = get_user(request)
    if not user:
        return jsonify({'error': 'No autorizado'}), 401
    data = request.get_json()
    if not data.get('title'):
        return jsonify({'error': 'Título requerido'}), 400
    board = Board(
        title=data['title'],
        color=data.get('color', '#7c6af7'),
        user_id=user['user_id']
    )
    db.session.add(board)
    db.session.flush()
    # Columnas por defecto
    for i, nombre in enumerate(['Por hacer', 'En progreso', 'Hecho']):
        col = Column(title=nombre, position=i, board_id=board.id)
        db.session.add(col)
    db.session.commit()
    return jsonify({'id': board.id, 'title': board.title, 'color': board.color}), 201

@boards_bp.route('/<int:board_id>', methods=['GET'])
def get_board(board_id):
    user = get_user(request)
    if not user:
        return jsonify({'error': 'No autorizado'}), 401
    board = Board.query.filter_by(id=board_id, user_id=user['user_id']).first()
    if not board:
        return jsonify({'error': 'Tablero no encontrado'}), 404
    return jsonify({
        'id': board.id,
        'title': board.title,
        'color': board.color,
        'columns': [{
            'id': col.id,
            'title': col.title,
            'position': col.position,
            'cards': [{
                'id': card.id,
                'title': card.title,
                'description': card.description,
                'color': card.color,
                'due_date': card.due_date.isoformat() if card.due_date else None,
                'position': card.position
            } for card in col.cards]
        } for col in board.columns]
    })

@boards_bp.route('/<int:board_id>', methods=['DELETE'])
def delete_board(board_id):
    user = get_user(request)
    if not user:
        return jsonify({'error': 'No autorizado'}), 401
    board = Board.query.filter_by(id=board_id, user_id=user['user_id']).first()
    if not board:
        return jsonify({'error': 'Tablero no encontrado'}), 404
    db.session.delete(board)
    db.session.commit()
    return jsonify({'message': 'Tablero eliminado'}), 200