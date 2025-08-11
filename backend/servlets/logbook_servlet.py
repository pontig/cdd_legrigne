"""
Logbook Servlet
"""

from flask import Blueprint, jsonify, request
from config.check_session import check_session
from dao.logbook_dao import logbook_dao

logbook_bp = Blueprint('logbook', __name__)

@logbook_bp.route('/logbook', methods=['GET'])
def get_logbook_entries():
    """Get logbook entries for a specific person"""
    person_id = request.args.get('person_id', type=int)
    
    if check_session() is False:
        return jsonify({'error': 'Unauthorized access'}), 401
    
    if not person_id:
        return jsonify({'error': 'Missing or invalid person_id'}), 400
    
    try:
        logbook_entries = logbook_dao.get_logbook_entries(person_id)
        
        return jsonify(logbook_entries), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@logbook_bp.route('/new_logbook_entry', methods=['POST'])
def create_logbook_entry():
    """Create a new logbook entry"""
    data = request.get_json()
    
    if check_session() is False:
        return jsonify({'error': 'Unauthorized access'}), 401

    required_fields = ['person_id', 'date', 'event', 'intervention']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing field: {field}'}), 400

    try:
        logbook_dao.create_logbook_entry(data)
        return jsonify({'message': 'Logbook entry created successfully'}), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@logbook_bp.route('/delete_logbook', methods=['GET'])
def delete_logbook():
    """Delete all logbook entries for a specific person"""
    id = request.args.get('id', type=int)
    
    if check_session() is False:
        return jsonify({'error': 'Unauthorized access'}), 401
    
    if not id:
        return jsonify({'error': 'Missing or invalid id'}), 400
    
    try:
        logbook_dao.delete_logbook_entries(id)
        return jsonify({'message': 'Logbook entries deleted successfully'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500