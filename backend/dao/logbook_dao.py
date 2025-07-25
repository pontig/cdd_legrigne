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
            ORDER BY anno DESC, mese_int DESC, giorno DESC
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
                    'date': str(row[4]) + '-' + str(row[3]).zfill(2) + '-' + str(row[2]).zfill(2),
                    'event': row[5],
                    'intervention': row[6],
                    'signature': row[7]
                })
            return logbook_entries
        
        except Exception as e:
            if connection:
                connection.rollback()
            
            return str(e)
        
        finally:
            if cursor:
                cursor.close()
            if connection:
                connection.close()