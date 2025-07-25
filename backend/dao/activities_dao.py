"""
Data Access Object for activities
"""

from typing import List
from config.database import db_config

class ActivitiesDAO:
    """Data Access Object for activities"""
    
    def get_activities(self, person_id: int) -> List[dict]:
        """Get activities for a specific person"""
        query = """
            SELECT * FROM partecipazione_attivita pa
            JOIN attivita a ON pa.attivita = a.id
            WHERE id_persona = %s
            ORDER BY anno DESC, mese_int DESC, giorno DESC
        """
        
        connection = None
        cursor = None
        
        try:
            connection = db_config.get_connection()
            cursor = connection.cursor()
            cursor.execute(query, (person_id,))
            results = cursor.fetchall()
            
            activities = []
            for row in results:
                activities.append({
                    'id': row[0],
                    'person_id': row[1],
                    'date': str(row[4]) + '-' + str(row[3]) + '-' + str(row[2]),
                    'morning': row[5],
                    'activity': row[14],
                    'adesion': row[7],
                    'participation': row[8],
                    'mood': row[9],
                    'communication': row[10],
                    'problematic_behaviour': row[11]
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