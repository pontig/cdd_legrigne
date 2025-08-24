"""
Activities servlet, responsible for handling requests related to partecipazione_attivita
"""

from flask import Blueprint, request, jsonify, session
from config.check_session import check_session
from dao.activities_dao import activities_dao
from datetime import datetime
import io
import base64
import matplotlib
import matplotlib.pyplot as plt
import matplotlib.dates as mdates

matplotlib.use('Agg')

activities_bp = Blueprint('activities', __name__)

@activities_bp.route('/activities', methods=['GET'])
def get_activities():
    """ Get activities for a specific person """
    person_id = request.args.get('person_id', type=int)
    month = request.args.get('month', type=int, default=None)

    if check_session() is False:
        return jsonify({'error': 'Unauthorized access'}), 401
    
    if not person_id:
        return jsonify({'error': 'Missing or invalid person_id'}), 400
    
    try:

        activities = activities_dao.get_activities(person_id, month=month)
        
        # Extract dates and values for plotting
        dates = []
        moods = []
        communications = []

        for activity in activities:
            try:
                date_obj = datetime.strptime(activity['date'], '%Y-%m-%d')
                dates.append(date_obj)
                moods.append(activity['mood'])
                communications.append(activity['communication'])
            except (ValueError, KeyError):
                continue

        # Create the plot
        plt.figure(figsize=(10, 6))
        plt.plot(dates, moods, marker='o', label='Umore', linewidth=2, color='#005073')
        plt.plot(dates, communications, marker='s', label='Comunicazione', linewidth=2, color='#60A5FA')

        plt.xlabel('Data')
        plt.ylabel('Indice')
        # plt.title(f'Adesione e partecipazione')
        plt.legend()
        plt.grid(True, alpha=0.3)
        plt.gca().yaxis.set_major_locator(plt.MaxNLocator(integer=True))
        plt.ylim(0.5, 8.5)
        
        # # Set transparent background
        # plt.gca().patch.set_alpha(0.5)
        # plt.gcf().patch.set_alpha(0.5)

        # Format x-axis dates
        plt.gca().xaxis.set_major_formatter(mdates.DateFormatter('%Y-%m-%d'))
        plt.gca().xaxis.set_major_locator(mdates.MonthLocator())
        plt.xticks(rotation=45)

        plt.tight_layout()

        # Convert plot to base64 string
        img_buffer = io.BytesIO()
        plt.savefig(img_buffer, format='png')
        img_buffer.seek(0)
        plot_image = base64.b64encode(img_buffer.getvalue()).decode()
        plt.close()

        # Add plot to response
        activities_response = {
            'activities': activities,
            'plot_image': plot_image
        }

        return jsonify(activities_response), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@activities_bp.route('/new_activity_entry', methods=['POST'])
def create_activity_entry():
    """ Create a new activity entry """
    data = request.get_json()
    
    if check_session() is False:
        return jsonify({'error': 'Unauthorized access'}), 401

    required_fields = [
        'person_id',
        'date',
        'morning',
        'activity',
        'adesion',
        'participation',
        'mood',
        'communication'
    ]
    
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing field: {field}'}), 400

    try:
        activities_dao.create_activity_entry(data)
        return jsonify({'message': 'Activity entry created successfully'}), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@activities_bp.route('/delete_activity', methods=['GET'])
def delete_activity():
    """ Delete an activity entry """
    activity_id = request.args.get('id', type=int)

    if check_session() is False:
        return jsonify({'error': 'Unauthorized access'}), 401

    if not activity_id:
        return jsonify({'error': 'Missing or invalid activity ID'}), 400

    try:
        activities_dao.delete_activity(activity_id)
        return jsonify({'message': 'Activity deleted successfully'}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@activities_bp.route('/declare_absence', methods=['POST'])
def declare_absence():
    """ Declare absence for a person """
    data = request.get_json()
    
    if check_session() is False:
        return jsonify({'error': 'Unauthorized access'}), 401

    required_fields = ['person_id', 'date']
    
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing field: {field}'}), 400

    try:
        activities_dao.declare_absence(data)
        return jsonify({'message': 'Absence declared successfully'}), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 500