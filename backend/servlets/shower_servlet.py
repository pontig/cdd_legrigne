"""
Shower Servlet
"""

from flask import Blueprint, jsonify, request
from config.check_session import check_session
from dao.shower_dao import shower_dao

shower_bp = Blueprint('shower', __name__)

@shower_bp.route('/shower', methods=['GET'])
def get_shower_entries():
    """Get toilet entries for a specific person"""
    person_id = request.args.get('person_id', type=int)
    if not person_id:
        return jsonify({'error': 'Missing person_id parameter'}), 400
    
    try:
        shower_entries = shower_dao.get_shower_entries(person_id)
        return jsonify(shower_entries), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@shower_bp.route('/new_shower_entry', methods=['POST'])
def create_shower_entry():
    """Create a new shower entry"""
    data = request.get_json()
    
    if check_session() is False:
        return jsonify({'error': 'Unauthorized access'}), 401

    required_fields = ['person_id', 'date', 'signature']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing field: {field}'}), 400

    try:
        shower_dao.create_shower_entry(data)
        return jsonify({'message': 'Shower entry created successfully'}), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@shower_bp.route('/delete_shower_entry', methods=['GET'])
def delete_shower_entry():
    """Delete a shower entry"""
    entry_id = request.args.get('entry_id', type=int)
    if not entry_id:
        return jsonify({'error': 'Missing entry_id parameter'}), 400

    if check_session() is False:
        return jsonify({'error': 'Unauthorized access'}), 401

    try:
        shower_dao.delete_shower_entry(entry_id)
        return jsonify({'message': 'Shower entry deleted successfully'}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500