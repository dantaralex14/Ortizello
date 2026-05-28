from database import db
from datetime import datetime

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(200), nullable=False)
    boards = db.relationship('Board', backref='owner', lazy=True, cascade='all, delete')

class Board(db.Model):
    __tablename__ = 'boards'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    color = db.Column(db.String(20), default='#7c6af7')
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    columns = db.relationship('Column', backref='board', lazy=True, cascade='all, delete', order_by='Column.position')

class Column(db.Model):
    __tablename__ = 'columns'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    position = db.Column(db.Integer, default=0)
    board_id = db.Column(db.Integer, db.ForeignKey('boards.id'), nullable=False)
    cards = db.relationship('Card', backref='column', lazy=True, cascade='all, delete', order_by='Card.position')

class Card(db.Model):
    __tablename__ = 'cards'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    color = db.Column(db.String(20), default='#1e2433')
    due_date = db.Column(db.DateTime)
    position = db.Column(db.Integer, default=0)
    column_id = db.Column(db.Integer, db.ForeignKey('columns.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)