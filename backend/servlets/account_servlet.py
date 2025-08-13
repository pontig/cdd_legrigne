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

    user_id, permissions = account_dao.login(name, surname, password_sha256)

    if user_id:
        session['user_id'] = user_id
        session['name'] = name
        session['surname'] = surname
        session['permissions'] = permissions
        session.permanent = True
        session['semester'] = None

        return jsonify({
            'message': 'Login successful',
            'user_id': user_id,
            'permissions': permissions,
            'name': name,
            'surname': surname
        }), 200
    return jsonify({'error': 'Invalid credentials'}), 401

@account_bp.route('/logout')
def logout():
    """Handle user logout"""
    session.clear()
    return jsonify({'message': 'Logout successful'}), 200

@account_bp.route('/change_password', methods=['POST'])
def change_password():
    """Change user password"""
    if not check_session():
        return jsonify({'error': 'Unauthorized access'}), 401
    
    data = request.json
    old_password = data.get('old_password')
    new_password = data.get('new_password')
    account_id = session.get('user_id')
        
    if not old_password or not new_password or not account_id:
        return jsonify({'error': 'Missing required fields'}), 400
    
    old_password_sha256 = hashlib.sha256(old_password.encode('utf-8')).hexdigest()
    new_password_sha256 = hashlib.sha256(new_password.encode('utf-8')).hexdigest()
    
    print(f"Changing password for account ID {account_id} with old password {old_password} and new password  {new_password}")

    try:
        result = account_dao.change_password(account_id, old_password_sha256, new_password_sha256)
        if result:
            return jsonify({'message': 'Password changed successfully'}), 200
        else:
            return jsonify({'error': 'Old password is incorrect'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@account_bp.route('/get_all_account_infos', methods=['GET'])
def get_all_account_infos():
    """Get all account information for admin users"""
    if not check_session():
        return jsonify({'error': 'Unauthorized access'}), 401
    
    if session.get('permissions', 0) < 10:
        return jsonify({'error': 'Insufficient permissions'}), 403

    try:
        account_infos = account_dao.get_all_account_infos()
        return jsonify(account_infos), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@account_bp.route('/change_permissions', methods=['GET'])
def change_permissions():
    """Change user permissions"""
    if not check_session():
        return jsonify({'error': 'Unauthorized access'}), 401
    
    if session.get('permissions', 0) < 10:
        return jsonify({'error': 'Insufficient permissions'}), 403

    account_id = request.args.get('user_id', type=int)
    new_permissions = request.args.get('permissions', type=int)

    if not account_id or new_permissions is None:
        return jsonify({'error': 'Missing required fields'}), 400

    try:
        result = account_dao.change_permissions(account_id, new_permissions)
        if result:
            return jsonify({'message': 'Permissions changed successfully'}), 200
        else:
            return jsonify({'error': 'Failed to change permissions'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@account_bp.route('/new_operator', methods=['POST'])
def new_operator():
    """Create a new operator account"""
    if not check_session():
        return jsonify({'error': 'Unauthorized access'}), 401
    
    if session.get('permissions', 0) < 10:
        return jsonify({'error': 'Insufficient permissions'}), 403

    data = request.json
    name = data.get('name')
    surname = data.get('surname')
    permissions = data.get('permissions') if 'permissions' in data else 0    
    
    if not name or not surname:
        return jsonify({'error': 'Missing required fields'}), 400

    default_password = 'password'
    password_sha256 = hashlib.sha256(default_password.encode('utf-8')).hexdigest()

    try:
        account_dao.create_operator(name, surname, password_sha256, permissions)
        return jsonify({'message': 'Operator created successfully'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500