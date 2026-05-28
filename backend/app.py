from flask import Flask
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from database import db
from config import Config

bcrypt = Bcrypt()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    CORS(app)
    db.init_app(app)
    bcrypt.init_app(app)

    from routes.auth import auth_bp
    from routes.boards import boards_bp
    from routes.columns import columns_bp
    from routes.cards import cards_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(boards_bp, url_prefix='/api/boards')
    app.register_blueprint(columns_bp, url_prefix='/api/columns')
    app.register_blueprint(cards_bp, url_prefix='/api/cards')

    with app.app_context():
        from models import User, Board, Column, Card
        db.create_all()

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)