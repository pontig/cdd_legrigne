"""
Toilet Servlet
"""

from flask import Blueprint, jsonify, request
from config.check_session import check_session
from dao.toilet_dao import toilet_dao

toilet_bp = Blueprint('toilet', __name__)

@toilet_bp.route('/toilet', methods=['GET'])
def get_toilet_entries():
    """Get toilet entries for a specific person"""
    person_id = request.args.get('person_id', type=int)
    if not person_id:
        return jsonify({'error': 'Missing person_id parameter'}), 400
    
    try:
        toilet_entries = toilet_dao.get_toilet_entries(person_id)
        return jsonify(toilet_entries), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@toilet_bp.route('/new_toilet_entry', methods=['POST'])
def create_toilet_entry():
    """Create a new toilet entry"""
    data = request.get_json()
    
    if check_session() is False:
        return jsonify({'error': 'Unauthorized access'}), 401

    required_fields = ['person_id', 'date', 'morning', 'urine', 'feces', 'diaper', 'signature']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing field: {field}'}), 400

    try:
        toilet_dao.create_toilet_entry(data)
        return jsonify({'message': 'Toilet entry created successfully'}), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@toilet_bp.route('/delete_toilet_entry', methods=['GET'])
def delete_toilet_entry():
    """Delete a toilet entry"""
    entry_id = request.args.get('entry_id', type=int)
    if not entry_id:
        return jsonify({'error': 'Missing entry_id parameter'}), 400

    if check_session() is False:
        return jsonify({'error': 'Unauthorized access'}), 401

    try:
        toilet_dao.delete_toilet_entry(entry_id)
        return jsonify({'message': 'Toilet entry deleted successfully'}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500