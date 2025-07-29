"""
Data Access Object for Problem Behavior
"""

from typing import List, Dict
from flask import Blueprint, jsonify, session
from config.database import db_config

class ProblemBehaviorDAO:
    """Data Access Object for problem behavior"""
    
    def get_problem_behaviors(self, person_id: int) -> List[Dict]:
        """Get problem behaviors for a specific person"""
        semester_constraint = " = %s" if session.get('semester') is not None else " IS NULL"
        
        connection = None
        cursor = None
        
        try:
            connection = db_config.get_connection()
            cursor = connection.cursor()
            
            # First, get all problems to build the structure
            cursor.execute("SELECT id, nome, classe FROM problema ORDER BY classe, nome")
            problems = cursor.fetchall()
            
            # Group problems by class for frontend
            grouped_problems = {}
            for problem in problems:
                problem_dict = {
                    'id': problem[0],
                    'nome': problem[1],
                    'classe': problem[2]
                }
                classe = problem_dict['classe']
                if classe not in grouped_problems:
                    grouped_problems[classe] = []
                grouped_problems[classe].append(problem_dict)
            
            # Get all comportamento_problema records for the person
            query_behaviors = f"""
                SELECT 
                    id,
                    id_persona,
                    giorno,
                    mese_int,
                    anno,
                    intensita,
                    durata,
                    causa,
                    contenimento,
                    firma
                FROM comportamento_problema 
                WHERE id_persona = %s AND id_semestre {semester_constraint}
                ORDER BY anno DESC, mese_int DESC, giorno DESC
            """
            
            if session.get('semester') is not None:
                cursor.execute(query_behaviors, (person_id, session.get('semester')))
            else:
                cursor.execute(query_behaviors, (person_id,))
            
            behavior_rows = cursor.fetchall()
            
            # Get all evento_comportamento relationships for these behaviors
            if behavior_rows:
                behavior_ids = [row[0] for row in behavior_rows]
                placeholders = ','.join(['%s'] * len(behavior_ids))
                
                query_events = f"""
                    SELECT id_evento, id_comportamento
                    FROM evento_comportamento
                    WHERE id_evento IN ({placeholders})
                """
                
                cursor.execute(query_events, behavior_ids)
                event_relationships = cursor.fetchall()
                
                # Create a mapping of behavior_id -> set of problem_ids
                behavior_to_problems = {}
                for event_id, problem_id in event_relationships:
                    if event_id not in behavior_to_problems:
                        behavior_to_problems[event_id] = set()
                    behavior_to_problems[event_id].add(problem_id)
            else:
                behavior_to_problems = {}
            
            # Build the final result
            behaviors = []
            for row in behavior_rows:
                behavior_dict = {
                    'id': row[0],
                    'person_id': row[1],
                    'date': str(row[4]) + '-' + str(row[3]).zfill(2) + '-' + str(row[2]).zfill(2),
                    'intensity': row[5],
                    'duration': row[6],
                    'cause': row[7],
                    'containment': row[8],
                    'signature': row[9],
                }
                
                # Add boolean columns for each problem
                behavior_id = row[0]
                associated_problems = behavior_to_problems.get(behavior_id, set())
                
                # Create ordered array of problem statuses
                problem_statuses = []
                for problem in problems:
                    problem_id = problem[0]
                    problem_statuses.append(1 if problem_id in associated_problems else 0)
                
                behavior_dict['problem_statuses'] = problem_statuses
                
                behaviors.append(behavior_dict)

            return jsonify({
                'behaviors': behaviors,
                'problems': grouped_problems
            })
        
        except Exception as e:
            if connection:
                connection.rollback()
            
            return str(e)
        
        finally:
            if cursor:
                cursor.close()
            if connection:
                connection.close()
                
problem_behavior_dao = ProblemBehaviorDAO()