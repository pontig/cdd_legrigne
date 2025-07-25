"""
Activities servlet, responsible for handling requests related to partecipazione_attivita
"""

from flask import Blueprint, request, jsonify
from dao.activities_dao import ActivitiesDAO
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
    
    if not person_id:
        return jsonify({'error': 'Missing or invalid person_id'}), 400
    
    try:

        activities_dao = ActivitiesDAO()
        activities = activities_dao.get_activities(person_id)
        
        # Extract dates and values for plotting
        dates = []
        adesions = []
        participations = []

        for activity in activities:
            try:
                date_obj = datetime.strptime(activity['date'], '%Y-%m-%d')
                dates.append(date_obj)
                adesions.append(activity['adesion'])
                participations.append(activity['participation'])
            except (ValueError, KeyError):
                continue

        # Create the plot
        plt.figure(figsize=(10, 6))
        plt.plot(dates, adesions, marker='o', label='Adesion', linewidth=2)
        plt.plot(dates, participations, marker='s', label='Participation', linewidth=2)

        plt.xlabel('Date')
        plt.ylabel('Score')
        plt.title(f'Adesion and Participation Over Time')
        plt.legend()
        plt.grid(True, alpha=0.3)

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