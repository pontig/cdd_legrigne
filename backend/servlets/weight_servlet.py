from flask import Blueprint, request, jsonify, session
from dao.weight_dao import weight_dao
from config.check_session import check_session
from datetime import datetime
import io
import base64
import matplotlib
import matplotlib.pyplot as plt
import matplotlib.dates as mdates

matplotlib.use('Agg')

weight_bp = Blueprint('weight', __name__)


@weight_bp.route('/weights', methods=['GET'])
def get_weights():
    """ Get weight entries for a specific person """
    person_id = request.args.get('person_id', type=int)
    
    if check_session() is False:
        return jsonify({'error': 'Unauthorized access'}), 401
    
    if not person_id:
        return jsonify({'error': 'Missing or invalid person_id'}), 400
    
    try:

        weights = weight_dao.get_weight_measurements(person_id)

        # Extract dates and values for plotting
        dates = []
        measurements = []

        for weight in weights:
            try:
                date_obj = datetime.strptime(weight['date'], '%Y-%m-%d')
                dates.append(date_obj)
                measurements.append(float(weight['weight']))
            except (ValueError, KeyError):
                continue

        # Create the plot
        plt.figure(figsize=(10, 6))
        plt.plot(dates, measurements, marker='o', label='Peso', linewidth=2, color='#005073')

        plt.xlabel('Data')
        plt.ylabel('Peso (kg)')
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
        weight_response = {
            'weights': weights,
            'plot_image': plot_image
        }

        return jsonify(weight_response), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@weight_bp.route('/new_weight', methods=['POST'])
def create_weight_entry():
    """ Create a new weight entry """
    data = request.get_json()
    
    if check_session() is False:
        return jsonify({'error': 'Unauthorized access'}), 401

    required_fields = [
        'person_id',
        'date',
        'value'
    ]
    
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing field: {field}'}), 400

    try:
        weight_dao.create_weight_entry(data)
        return jsonify({'message': 'Weight entry created successfully'}), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@weight_bp.route('/delete_weight', methods=['GET'])
def delete_weight():
    """ Delete a weight entry """
    weight_id = request.args.get('id', type=int)

    if check_session() is False:
        return jsonify({'error': 'Unauthorized access'}), 401

    if not weight_id:
        return jsonify({'error': 'Missing or invalid weight ID'}), 400

    try:
        weight_dao.delete_weight_entry(weight_id)
        return jsonify({'message': 'Weight deleted successfully'}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500