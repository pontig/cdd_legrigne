"""
Epileptic Seizures Servlet
"""

from flask import Blueprint, jsonify, request
from config.check_session import check_session
from dao.seizure_dao import seizure_dao

seizures_bp = Blueprint('seizures', __name__)

@seizures_bp.route('/seizures', methods=['GET'])
def get_seizures():
    """Get seizure entries for a specific person"""
    person_id = request.args.get('person_id', type=int)
    
    if check_session() is False:
        return jsonify({'error': 'Unauthorized access'}), 401
    
    if not person_id:
        return jsonify({'error': 'Missing or invalid person_id'}), 400
    
    try:
        seizure_entries = seizure_dao.get_seizures(person_id)
        return jsonify(seizure_entries), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@seizures_bp.route('/new_seizure', methods=['POST'])
def create_seizure():
    """Create a new seizure entry"""
    data = request.get_json()
    
    if check_session() is False:
        return jsonify({'error': 'Unauthorized access'}), 401

    required_fields = ['person_id', 'date', 'time', 'duration', 'signature']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing field: {field}'}), 400

    try:
        seizure_dao.create_seizure(data)
        return jsonify({'message': 'Seizure entry created successfully'}), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@seizures_bp.route('/delete_seizure', methods=['GET'])
def delete_seizure():
    """Delete all seizure entries for a specific person"""
    id = request.args.get('id', type=int)
    
    if check_session() is False:
        return jsonify({'error': 'Unauthorized access'}), 401
    
    if not id:
        return jsonify({'error': 'Missing or invalid id'}), 400
    
    try:
        seizure_dao.delete_seizure(id)
        return jsonify({'message': 'Seizure entries deleted successfully'}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500