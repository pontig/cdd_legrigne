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