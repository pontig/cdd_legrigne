"""
Account servlet for handling user account operations: login, logout, password reset, etc.
"""

from flask import Blueprint, request, jsonify, session
from config.check_session import check_session
import hashlib
from dao.account_dao import account_dao

account_bp = Blueprint('account', __name__)

@account_bp.route('/login', methods=['POST'])
def login():
    """Handle user login"""
    data = request.json
    name = data.get('name')
    surname = data.get('surname')
    password = data.get('password')
    
    if not name or not surname or not password:
        return jsonify({'error': 'Missing required fields'}), 400
    
    password_sha256 = hashlib.sha256(password.encode('utf-8')).hexdigest()

    user_id = account_dao.login(name, surname, password_sha256)

    if user_id:
        session['user_id'] = user_id
        session['name'] = name
        session['surname'] = surname
        session.permanent = True
        session['semester'] = None

        return jsonify({'message': 'Login successful'}), 200
    return jsonify({'error': 'Invalid credentials'}), 401

@account_bp.route('/logout')
def logout():
    """Handle user logout"""
    session.clear()
    return jsonify({'message': 'Logout successful'}), 200