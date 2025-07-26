"""
Semester servlet, responsible for handling semester views changea
"""

from flask import Blueprint, request, jsonify, session
from config.check_session import check_session
from dao.semester_dao import semester_dao

semester_bp = Blueprint('semester', __name__)

@semester_bp.route('/semesters_list', methods=['GET'])
def get_semesters():
    """Get all semesters"""
    if check_session() is False:
        return jsonify({'error': 'Unauthorized access'}), 401
    
    try:
        semesters = semester_dao.get_semesters()
        return jsonify(semesters), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@semester_bp.route('/set_semester', methods=['POST'])
def set_semester():
    """Set the current semester"""
    if check_session() is False:
        return jsonify({'error': 'Unauthorized access'}), 401
    
    data = request.get_json()
    semester_id = data.get('semester_id')
    
    if not semester_id:
        return jsonify({'error': 'Semester ID is required'}), 400
    
    try:
        session['semester'] = semester_id
        return jsonify({'message': 'Semester set successfully'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@semester_bp.route('/reset_semester', methods=['POST'])
def reset_semester():
    """Reset the current semester"""
    if check_session() is False:
        return jsonify({'error': 'Unauthorized access'}), 401
    
    try:
        session['semester'] = None
        return jsonify({'message': 'Semester reset successfully'}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500