"""
Logbook Servlet
"""

from flask import Blueprint, jsonify, request

logbook_bp = Blueprint('logbook', __name__)

@logbook_bp.route('/logbook', methods=['GET'])
def get_logbook_entries():
    """Get logbook entries for a specific person"""
    person_id = request.args.get('person_id', type=int)
    
    if not person_id:
        return jsonify({'error': 'Missing or invalid person_id'}), 400
    
    try:
        from dao.logbook_dao import LogbookDAO
        logbook_dao = LogbookDAO()
        logbook_entries = logbook_dao.get_logbook_entries(person_id)
        
        return jsonify(logbook_entries), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500