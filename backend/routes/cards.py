import os
import jwt
from flask import Blueprint, jsonify, request
from database import db
from models import Card, Column, Board
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

cards_bp = Blueprint('cards', __name__)
SECRET_KEY = os.environ.get('SECRET_KEY', 'ortizello_dev_key')

def get_user(request):
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    if not token:
        return None
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
    except:
        return None

@cards_bp.route('/', methods=['POST'])
def create_card():
    user = get_user(request)
    if not user:
        return jsonify({'error': 'No autorizado'}), 401
    data = request.get_json()
    col = Column.query.get_or_404(data.get('column_id'))
    board = Board.query.filter_by(id=col.board_id, user_id=user['user_id']).first()
    if not board:
        return jsonify({'error': 'No autorizado'}), 403
    due_date = None
    if data.get('due_date'):
        due_date = datetime.fromisoformat(data['due_date'])
    position = len(col.cards)
    card = Card(
        title=data['title'],
        description=data.get('description'),
        color=data.get('color', '#1e2433'),
        due_date=due_date,
        position=position,
        column_id=col.id
    )
    db.session.add(card)
    db.session.commit()
    return jsonify({
        'id': card.id, 'title': card.title,
        'description': card.description, 'color': card.color,
        'due_date': card.due_date.isoformat() if card.due_date else None,
        'position': card.position
    }), 201

@cards_bp.route('/<int:card_id>', methods=['PUT'])
def update_card(card_id):
    user = get_user(request)
    if not user:
        return jsonify({'error': 'No autorizado'}), 401
    card = Card.query.get_or_404(card_id)
    col = Column.query.get(card.column_id)
    board = Board.query.filter_by(id=col.board_id, user_id=user['user_id']).first()
    if not board:
        return jsonify({'error': 'No autorizado'}), 403
    data = request.get_json()
    if 'title' in data: card.title = data['title']
    if 'description' in data: card.description = data['description']
    if 'color' in data: card.color = data['color']
    if 'due_date' in data:
        card.due_date = datetime.fromisoformat(data['due_date']) if data['due_date'] else None
    db.session.commit()
    return jsonify({'message': 'Tarjeta actualizada'}), 200

@cards_bp.route('/move', methods=['PUT'])
def move_card():
    user = get_user(request)
    if not user:
        return jsonify({'error': 'No autorizado'}), 401
    data = request.get_json()
    card = Card.query.get_or_404(data['card_id'])
    card.column_id = data['column_id']
    card.position = data['position']
    db.session.commit()
    return jsonify({'message': 'Tarjeta movida'}), 200

@cards_bp.route('/<int:card_id>', methods=['DELETE'])
def delete_card(card_id):
    user = get_user(request)
    if not user:
        return jsonify({'error': 'No autorizado'}), 401
    card = Card.query.get_or_404(card_id)
    col = Column.query.get(card.column_id)
    board = Board.query.filter_by(id=col.board_id, user_id=user['user_id']).first()
    if not board:
        return jsonify({'error': 'No autorizado'}), 403
    db.session.delete(card)
    db.session.commit()
    return jsonify({'message': 'Tarjeta eliminada'}), 200