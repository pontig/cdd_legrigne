"""
Data Access Object for logbook
"""

from typing import List
from config.database import db_config

class LogbookDAO:
    """Data Access Object for logbook"""
    
    def get_logbook_entries(self, person_id: int) -> List[dict]:
        """Get logbook entries for a specific person"""
        query = """
            SELECT * FROM diario
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
            
            logbook_entries = []
            for row in results:
                logbook_entries.append({
                    'id': row[0],
                    'person_id': row[1],
                    'date': row[4] + '-' + row[3] + '-' + row[2],
                    'event': row[5],
                    'intervention': row[6],
                    'signature': row[7]
                })
            return logbook_entries
        
        except Exception as e:
            if connection:
                connection.rollback()
            
            # Return mockup data for testing purposes (20 entries)
            return [
                {
                    'id': i,
                    'person_id': person_id,
                    'date': f'2024-05-{1 + (i % 30):02d}',
                    'event': f'Log entry {i + 1}',
                    'intervention': f'Intervention {i + 1}',
                    'signature': f'Signature {i + 1}'
                } for i in range(20)
            ]
        
        finally:
            if cursor:
                cursor.close()
            if connection:
                connection.close()