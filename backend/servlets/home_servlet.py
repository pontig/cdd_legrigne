"""
Home servlet for handling requests related to the home page of the application.
"""
from flask import Blueprint, request, jsonify, session

from config.check_session import check_session
from dao.home_dao import home_dao

home_bp = Blueprint('home', __name__)

@home_bp.route('/home', methods=['GET'])
def home():
    """ Get guests and their missing activities from the last week """
        
    if check_session() is False:
        return jsonify({'error': 'Unauthorized access'}), 401

    try:
        ret = home_dao.get_home_data()
        
        return jsonify(ret), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@home_bp.route('/delete_guest', methods=['GET'])
def delete_guest():
    """ Delete a guest by ID """
    
    if check_session() is False:
        return jsonify({'error': 'Unauthorized access'}), 401
    
    guest_id = request.args.get('guest_id', type=int)
    
    if not guest_id:
        return jsonify({'error': 'Missing or invalid guest ID'}), 400
    
    try:
        home_dao.delete_guest(guest_id)
        return jsonify({'message': 'Guest deleted successfully'}), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500