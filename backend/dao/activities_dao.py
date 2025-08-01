"""
Data Access Object for activities
"""

from typing import List

from flask import session
from config.database import db_config

class ActivitiesDAO:
    """Data Access Object for activities"""
    
    def get_activities(self, person_id: int) -> List[dict]:
        """Get activities for a specific person"""
        semester_constraint = " = %s" if session.get('semester') is not None else " IS NULL"
        query = f"""
            SELECT 
                pa.id,
                pa.id_persona,
                pa.giorno,
                pa.mese_int,
                pa.anno,
                pa.mattino,
                a.nome_attivita,
                pa.adesione,
                pa.partecipazione,
                pa.umore,
                pa.comunicazione,
                pa.comportamento_problematico,
                a.id as attivita_id

            FROM partecipazione_attivita pa
            JOIN attivita a ON pa.attivita = a.id
            WHERE id_persona = %s AND pa.id_semestre {semester_constraint}
            ORDER BY anno DESC, mese_int DESC, giorno DESC
        """
        
        connection = None
        cursor = None
        
        try:
            connection = db_config.get_connection()
            cursor = connection.cursor()
            if session.get('semester') is not None:
                cursor.execute(query, (person_id, session.get('semester')))
            else:
                cursor.execute(query, (person_id,))
            results = cursor.fetchall()
            
            activities = []
            for row in results:
                activities.append({
                    'id': row[0],
                    'person_id': row[1],
                    'date': str(row[4]) + '-' + str(row[3]).zfill(2) + '-' + str(row[2]).zfill(2),
                    'morning': row[5],
                    'activity': row[6],
                    'adesion': row[7],
                    'participation': row[8],
                    'mood': row[9],
                    'communication': row[10],
                    'problem_behaviour': row[11],
                    'activity_id': row[12]
                })
            return activities
        
        except Exception as e:
            if connection:
                connection.rollback()
            raise e  # Raise the exception for the caller to handle

        finally:
            if cursor:
                cursor.close()
            if connection:
                connection.close()
                
activities_dao = ActivitiesDAO()