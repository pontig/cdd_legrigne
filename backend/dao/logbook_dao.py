"""
Data Access Object for logbook
"""

from typing import List
from flask import session
from config.database import db_config

class LogbookDAO:
    """Data Access Object for logbook"""
    
    def get_logbook_entries(self, person_id: int) -> List[dict]:
        """Get logbook entries for a specific person"""
        semester_constraint = " = %s" if session.get('semester') is not None else " IS NULL"
        query = f"""
            SELECT * FROM diario
            WHERE id_persona = %s AND id_semestre {semester_constraint}
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
                
logbook_dao = LogbookDAO()