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
            SELECT * FROM partecipazione_attivita
            WHERE id_persona = %s
            ORDER BY year, month_int, day
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
                    'date': row[4] + '-' + row[3] + '-' + row[2],
                    'morning': row[5],
                    'activity': row[6],
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
            
            # Return mockup data for testing purposes (20 entries)
            return [
                {
                    'id': i,
                    'person_id': person_id,
                    'date': f'2024-{str(1 + (i % 12)).zfill(2)}-{str(1 + (i % 30)).zfill(2)}',
                    'morning': i % 2 == 0,
                    'activity': f'Activity {i + 1}',
                    'adesion': 2,
                    'participation': (i % 4) + 1,
                    'mood': 5,
                    'communication': (i % 4) + 1,
                    'problematic_behaviour': (i % 3 == 0)
                } for i in range(20)
            ]
        
        finally:
            if cursor:
                cursor.close()
            if connection:
                connection.close()
        return []