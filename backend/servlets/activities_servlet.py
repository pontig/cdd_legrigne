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
    
    if check_session() is False:
        return jsonify({'error': 'Unauthorized access'}), 401
    
    if not person_id:
        return jsonify({'error': 'Missing or invalid person_id'}), 400
    
    try:

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
        plt.plot(dates, adesions, marker='o', label='Adesione', linewidth=2)
        plt.plot(dates, participations, marker='s', label='Partecipazione', linewidth=2)

        plt.xlabel('Data')
        plt.ylabel('Indice')
        # plt.title(f'Adesione e partecipazione')
        plt.legend()
        plt.grid(True, alpha=0.3)
        plt.gca().yaxis.set_major_locator(plt.MaxNLocator(integer=True))
        plt.ylim(0.5, 4.5)
        
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