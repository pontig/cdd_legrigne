"""
Home servlet for handling requests related to the home page of the application.
"""
from flask import Blueprint, request, jsonify

from dao.home_dao import home_dao

home_bp = Blueprint('home', __name__)

@home_bp.route('/home', methods=['GET'])
def home():
    """ Get guests and their missing activities from the last week """
    # TODO: check session for user authentication
    try:
        ret = home_dao.get_home_data()
        
        return jsonify(ret), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500