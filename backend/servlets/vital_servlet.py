from flask import Blueprint, request, jsonify, session
from dao.vital_dao import vital_dao
from config.check_session import check_session
from datetime import datetime
import io
import base64
import matplotlib
import matplotlib.pyplot as plt
import matplotlib.dates as mdates

matplotlib.use('Agg')

vital_bp = Blueprint('vital', __name__)


@vital_bp.route('/vitals', methods=['GET'])
def get_vitals():
    """ Get vital entries for a specific person """
    person_id = request.args.get('person_id', type=int)
    
    if check_session() is False:
        return jsonify({'error': 'Unauthorized access'}), 401
    
    if not person_id:
        return jsonify({'error': 'Missing or invalid person_id'}), 400
    
    try:

        vitals = vital_dao.get_vital_measurements(person_id)

        # Extract dates and values for plotting
        dates = []
        min_pressures = []
        max_pressures = []

        for vital in vitals:
            try:
                date_obj = datetime.strptime(vital['date'], '%Y-%m-%d')
                dates.append(date_obj)
                min_pressures.append(float(vital['min_pressure']))
                max_pressures.append(float(vital['max_pressure']))
            except (ValueError, KeyError):
                continue

        # Create the plot
        plt.figure(figsize=(10, 6))
        plt.plot(dates, max_pressures, marker='s', label='Massima', linewidth=2, color='#60A5FA')
        plt.plot(dates, min_pressures, marker='o', label='Minima', linewidth=2, color='#005073')

        plt.xlabel('Data')
        plt.ylabel('Valore (mmHg)')
        plt.legend()
        plt.grid(True, alpha=0.3)
        # plt.gca().yaxis.set_major_locator(plt.MaxNLocator(integer=True))
        
        # # Set transparent background
        # plt.gca().patch.set_alpha(0.5)
        # plt.gcf().patch.set_alpha(0.5)

        # Format x-axis dates
        plt.gca().xaxis.set_major_formatter(mdates.DateFormatter('%Y-%m-%d'))
        # plt.gca().xaxis.set_major_locator(mdates.MonthLocator())
        plt.xticks(rotation=45)

        plt.tight_layout()

        # Convert plot to base64 string
        img_buffer = io.BytesIO()
        plt.savefig(img_buffer, format='png')
        img_buffer.seek(0)
        plot_image = base64.b64encode(img_buffer.getvalue()).decode()
        plt.close()

        # Add plot to response
        vital_response = {
            'vitals': vitals,
            'plot_image': plot_image
        }

        return jsonify(vital_response), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@vital_bp.route('/new_vital', methods=['POST'])
def create_vital_entry():
    """ Create a new vital entry """
    data = request.get_json()
    
    if check_session() is False:
        return jsonify({'error': 'Unauthorized access'}), 401

    required_fields = [
        'person_id',
        'date',
        'min_pressure',
        'max_pressure',
        'temperature',
        'heart_rate',
        'saturation'
    ]
    
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing field: {field}'}), 400

    try:
        vital_dao.create_vital_entry(data)
        return jsonify({'message': 'vital entry created successfully'}), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@vital_bp.route('/delete_vital', methods=['GET'])
def delete_vital():
    """ Delete a vital entry """
    vital_id = request.args.get('id', type=int)

    if check_session() is False:
        return jsonify({'error': 'Unauthorized access'}), 401

    if not vital_id:
        return jsonify({'error': 'Missing or invalid vital ID'}), 400

    try:
        vital_dao.delete_vital_entry(vital_id)
        return jsonify({'message': 'vital deleted successfully'}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500