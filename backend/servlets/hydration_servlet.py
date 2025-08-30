"""
hydration Servlet
"""

from flask import Blueprint, jsonify, request
from config.check_session import check_session
from dao.hydration_dao import hydration_dao

hydration_bp = Blueprint('hydration', __name__)

@hydration_bp.route('/hydration', methods=['GET'])
def get_hydration_entries():
    """Get toilet entries for a specific person"""
    person_id = request.args.get('person_id', type=int)
    if not person_id:
        return jsonify({'error': 'Missing person_id parameter'}), 400
    
    try:
        hydration_entries = hydration_dao.get_hydration_entries(person_id)
        return jsonify(hydration_entries), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@hydration_bp.route('/new_hydration_entry', methods=['POST'])
def create_hydration_entry():
    """Create a new hydration entry"""
    data = request.get_json()
    
    if check_session() is False:
        return jsonify({'error': 'Unauthorized access'}), 401

    required_fields = ['person_id', 'date', 'signature']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing field: {field}'}), 400

    try:
        hydration_dao.create_hydration_entry(data)
        return jsonify({'message': 'hydration entry created successfully'}), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@hydration_bp.route('/delete_hydration_entry', methods=['GET'])
def delete_hydration_entry():
    """Delete a hydration entry"""
    entry_id = request.args.get('entry_id', type=int)
    if not entry_id:
        return jsonify({'error': 'Missing entry_id parameter'}), 400

    if check_session() is False:
        return jsonify({'error': 'Unauthorized access'}), 401

    try:
        hydration_dao.delete_hydration_entry(entry_id)
        return jsonify({'message': 'hydration entry deleted successfully'}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500