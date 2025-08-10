"""
Appreciations Servlet, responsible for handling appreciation-related requests.
"""

from flask import Blueprint, request, jsonify
from config.check_session import check_session
from dao.activities_dao import activities_dao
from datetime import datetime
import io
import base64
import matplotlib
import matplotlib.pyplot as plt
import matplotlib.dates as mdates

matplotlib.use('Agg')

appreciations_bp = Blueprint('appreciations', __name__)

@appreciations_bp.route('/appreciations', methods=['GET'])
def get_appreciations():
    """ Get appreciations for all persons """
    if check_session() is False:
        return jsonify({'error': 'Unauthorized access'}), 401
    
    try:
        month = request.args.get('month')
        appreciations = activities_dao.get_appreciations(month=month)
        
        graph_data = appreciations.get('appreciations', [])
        for person in graph_data:
            plt.figure(figsize=(10, 6))
            x_labels = [activity['abbreviazione'] for activity in person['activities']]
            adesione_values = [activity['media_adesione'] for activity in person['activities']]
            partecipazione_values = [activity['media_partecipazione'] for activity in person['activities']]
            
            x = range(len(x_labels))
            width = 0.35
            
            plt.bar([i - width/2 for i in x], adesione_values, width, label='Adesione')
            plt.bar([i + width/2 for i in x], partecipazione_values, width, label='Partecipazione')
            plt.xticks(x, x_labels)
            
            plt.xlabel('Attività')
            plt.ylabel('%')
            plt.title(f'Gradimenti attività per {person["nome"]} {person["cognome"]}')
            plt.legend()
            plt.grid(True, alpha=0.3)
            plt.gca().yaxis.set_major_locator(plt.MaxNLocator(integer=True))
            plt.ylim(0, 120)
            
            plt.tight_layout()
            img_buf = io.BytesIO()
            plt.savefig(img_buf, format='png')
            img_buf.seek(0)
            img_base64 = base64.b64encode(img_buf.getvalue()).decode()
            person['graph'] = img_base64
            plt.close()
        return jsonify(appreciations), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500