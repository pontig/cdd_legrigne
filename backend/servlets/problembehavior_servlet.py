"""
Problem behavior Servlet
"""

from flask import Blueprint, jsonify, request
from config.check_session import check_session
from dao.problembehavior_dao import problem_behavior_dao

problembehavior_bp = Blueprint('problem_behavior', __name__)

@problembehavior_bp.route('/problem_behavior', methods=['GET'])
def get_problem_behaviors():
    """Get problem behaviors for a specific person"""
    person_id = request.args.get('person_id', type=int)
    
    if check_session() is False:
        return jsonify({'error': 'Unauthorized access'}), 401
    
    if not person_id:
        return jsonify({'error': 'Missing or invalid person_id'}), 400
    
    try:
        problem_behaviors = problem_behavior_dao.get_problem_behaviors(person_id)
        
        return problem_behaviors, 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@problembehavior_bp.route('/new_problem_behavior_entry', methods=['POST'])
def create_problem_behavior_entry():
    """Create a new problem behavior entry"""
    data = request.get_json()
    
    if check_session() is False:
        return jsonify({'error': 'Unauthorized access'}), 401

    required_fields = [
        'person_id',
        'date',
        'problem_statuses',
        'intensity',
        'cause',
        'duration',
        'containment'
    ]
    
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing field: {field}'}), 400

    try:
        problem_behavior_dao.create_problem_behavior_entry(data)
        return jsonify({'message': 'Problem behavior entry created successfully'}), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@problembehavior_bp.route('/delete_problem_behavior', methods=['GET'])
def delete_problem_behavior():
    """Delete a problem behavior entry"""
    behavior_id = request.args.get('id', type=int)

    if check_session() is False:
        return jsonify({'error': 'Unauthorized access'}), 401

    if not behavior_id:
        return jsonify({'error': 'Missing or invalid behavior ID'}), 400

    try:
        problem_behavior_dao.delete_problem_behavior(behavior_id)
        return jsonify({'message': 'Problem behavior deleted successfully'}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500