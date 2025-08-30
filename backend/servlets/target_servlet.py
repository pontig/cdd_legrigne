"""
target Servlet
"""

from flask import Blueprint, jsonify, request
from config.check_session import check_session
from dao.target_dao import target_dao

target_bp = Blueprint('target', __name__)

@target_bp.route('/target', methods=['GET'])
def get_target_entries():
    """Get target entries for a specific person"""
    person_id = request.args.get('person_id', type=int)
    
    if check_session() is False:
        return jsonify({'error': 'Unauthorized access'}), 401
    
    if not person_id:
        return jsonify({'error': 'Missing or invalid person_id'}), 400
    
    try:
        target_entries = target_dao.get_target_entries(person_id)
        return jsonify(target_entries), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@target_bp.route('/new_target_entry', methods=['POST'])
def create_target_entry():
    """Create a new target entry"""
    data = request.get_json()
    
    if check_session() is False:
        return jsonify({'error': 'Unauthorized access'}), 401

    required_fields = ['person_id', 'date', 'event', 'intervention']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing field: {field}'}), 400

    try:
        target_dao.create_target_entry(data)
        return jsonify({'message': 'target entry created successfully'}), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@target_bp.route('/delete_target', methods=['GET'])
def delete_target():
    """Delete all target entries for a specific person"""
    id = request.args.get('id', type=int)
    
    if check_session() is False:
        return jsonify({'error': 'Unauthorized access'}), 401
    
    if not id:
        return jsonify({'error': 'Missing or invalid id'}), 400
    
    try:
        target_dao.delete_target_entries(id)
        return jsonify({'message': 'target entries deleted successfully'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500