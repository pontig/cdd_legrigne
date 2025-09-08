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
from info import mesi_ita
import uuid
import json
import os
import tempfile
import time

matplotlib.use('Agg')

appreciations_bp = Blueprint('appreciations', __name__)

appreciations_bp = Blueprint('appreciations', __name__)

# Use file-based session storage for multi-worker compatibility
SESSIONS_DIR = os.path.join(tempfile.gettempdir(), 'appreciations_sessions')

def ensure_sessions_dir():
    """Ensure the sessions directory exists"""
    if not os.path.exists(SESSIONS_DIR):
        os.makedirs(SESSIONS_DIR, exist_ok=True)

def get_session_file_path(session_id):
    """Get the file path for a session"""
    return os.path.join(SESSIONS_DIR, f"{session_id}.json")

def save_session_data(session_id, data):
    """Save session data to file"""
    ensure_sessions_dir()
    file_path = get_session_file_path(session_id)
    try:
        with open(file_path, 'w') as f:
            json.dump(data, f)
    except Exception as e:
        print(f"Error saving session data: {e}")

def load_session_data(session_id):
    """Load session data from file"""
    file_path = get_session_file_path(session_id)
    if not os.path.exists(file_path):
        return None
    try:
        with open(file_path, 'r') as f:
            return json.load(f)
    except Exception as e:
        print(f"Error loading session data: {e}")
        return None

def delete_session_data(session_id):
    """Delete session data file"""
    file_path = get_session_file_path(session_id)
    try:
        if os.path.exists(file_path):
            os.remove(file_path)
    except Exception as e:
        print(f"Error deleting session data: {e}")

def cleanup_old_sessions():
    """Clean up old session files to prevent disk space issues"""
    ensure_sessions_dir()
    try:
        current_time = time.time()
        for filename in os.listdir(SESSIONS_DIR):
            if filename.endswith('.json'):
                file_path = os.path.join(SESSIONS_DIR, filename)
                # Remove files older than 1 hour
                if current_time - os.path.getmtime(file_path) > 3600:
                    os.remove(file_path)
    except Exception as e:
        print(f"Error cleaning up old sessions: {e}")

def generate_graph(person, month):
    """Generate graph for a person and return the base64 encoded image"""
    try:
        plt.figure(figsize=(10, 6))
        x_labels = [activity['abbreviazione'] for activity in person['activities']]
        adesione_values = [activity['media_adesione'] for activity in person['activities']]
        partecipazione_values = [activity['media_partecipazione'] for activity in person['activities']]
        
        x = range(len(x_labels))
        width = 0.35
        
        plt.bar([i - width/2 for i in x], adesione_values, width, label='Adesione', color='#005073')
        plt.bar([i + width/2 for i in x], partecipazione_values, width, label='Partecipazione', color='#60A5FA')
        plt.xticks(x, x_labels)
        
        plt.xlabel('Attività')
        plt.ylabel('%')
        if month is not None:
            month_name = mesi_ita[int(month) - 1]
            plt.title(f'Gradimenti attività per {person["nome"]} {person["cognome"]} - {month_name}')
        else:
            plt.title(f'Gradimenti attività per {person["nome"]} {person["cognome"]}')
        plt.legend()
        plt.grid(True, alpha=0.3)
        plt.gca().yaxis.set_major_locator(plt.MaxNLocator(integer=True))
        plt.ylim(0, 104)
        
        plt.tight_layout()
        img_buf = io.BytesIO()
        plt.savefig(img_buf, format='png')
        img_buf.seek(0)
        img_base64 = base64.b64encode(img_buf.getvalue()).decode()
        plt.close()
        
        return img_base64
        
    except Exception as e:
        print(f"Error generating graph for person {person['id_persona']}: {str(e)}")
        return None

@appreciations_bp.route('/appreciations', methods=['GET'])
def get_appreciations():
    """ Get appreciations for all persons - returns data immediately without graphs """
    if check_session() is False:
        return jsonify({'error': 'Unauthorized access'}), 401
    
    try:
        month = request.args.get('month')
        appreciations = activities_dao.get_appreciations(month=month)
        
        # Generate a unique session ID for this request
        session_id = str(uuid.uuid4())
        
        # Clean up old sessions periodically
        cleanup_old_sessions()
        
        # Store session data for graph generation
        graph_data = appreciations.get('appreciations', [])
        session_data = {
            'persons': graph_data,
            'month': month,
            'generated_graphs': {},
            'next_index': 0
        }
        save_session_data(session_id, session_data)
        
        # Remove graph field from initial response and mark as not ready
        for person in graph_data:
            person['graph'] = None
            person['graph_ready'] = False
        
        # Add session_id to response
        appreciations['session_id'] = session_id
        
        return jsonify(appreciations), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@appreciations_bp.route('/appreciations/next-graph/<session_id>', methods=['GET'])
def get_next_graph(session_id):
    """ Generate and return the next graph in the queue """
    if check_session() is False:
        return jsonify({'error': 'Unauthorized access'}), 401
    
    try:
        session_data = load_session_data(session_id)
        if session_data is None:
            return jsonify({'error': 'Session not found'}), 404
        
        persons = session_data['persons']
        month = session_data['month']
        next_index = session_data['next_index']
        
        # Check if there are more graphs to generate
        if next_index >= len(persons):
            # Clean up session when complete
            delete_session_data(session_id)
            return jsonify({'completed': True}), 200
        
        # Generate the next graph
        person = persons[next_index]
        graph_base64 = generate_graph(person, month)
        
        if graph_base64:
            # Store the generated graph
            session_data['generated_graphs'][str(person['id_persona'])] = graph_base64
            session_data['next_index'] = next_index + 1
            
            # Check if this was the last graph
            is_completed = next_index + 1 >= len(persons)
            
            # Save updated session data
            if not is_completed:
                save_session_data(session_id, session_data)
            else:
                # Clean up session when complete
                delete_session_data(session_id)
            
            return jsonify({
                'person_id': person['id_persona'],
                'graph': graph_base64,
                'completed': is_completed,
                'progress': {
                    'current': next_index + 1,
                    'total': len(persons)
                }
            }), 200
        else:
            # Skip this person if graph generation failed
            session_data['next_index'] = next_index + 1
            save_session_data(session_id, session_data)
            return jsonify({'error': f'Failed to generate graph for person {person["id_persona"]}'}), 500
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@appreciations_bp.route('/appreciations/graph/<session_id>/<int:person_id>', methods=['GET'])
def get_person_graph(session_id, person_id):
    """ Get a specific person's graph if it's ready """
    if check_session() is False:
        return jsonify({'error': 'Unauthorized access'}), 401
    
    try:
        session_data = load_session_data(session_id)
        if session_data is None:
            return jsonify({'ready': False}), 200
        
        generated_graphs = session_data['generated_graphs']
        
        if str(person_id) in generated_graphs:
            return jsonify({'graph': generated_graphs[str(person_id)], 'ready': True}), 200
        else:
            return jsonify({'ready': False}), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@appreciations_bp.route('/appreciations/graphs/<session_id>', methods=['GET'])
def get_all_graphs_status(session_id):
    """ Get status of all graphs for a session """
    if check_session() is False:
        return jsonify({'error': 'Unauthorized access'}), 401
    
    try:
        session_data = load_session_data(session_id)
        if session_data is None:
            return jsonify({'graphs': {}}), 200
        
        return jsonify({'graphs': session_data['generated_graphs']}), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500