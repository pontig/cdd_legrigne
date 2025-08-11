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
                
    def create_logbook_entry(self, data: dict) -> None:
        """Create a new logbook entry"""
        query = """
            INSERT INTO diario VALUES (NULL, %s, %s, %s, %s, %s, %s, %s, NULL)
        """
        
        connection = None
        cursor = None
        
        try:
            date = data['date'].split('-') # YYYY-MM-DD format
            connection = db_config.get_connection()
            cursor = connection.cursor()
            cursor.execute(query, (
                data['person_id'],
                date[2],
                date[1],
                date[0],
                data['event'],
                data['intervention'],
                data.get('signature', None)
            ))
            connection.commit()

        except Exception as e:
            if connection:
                connection.rollback()
            raise Exception(f"Error creating logbook entry: {str(e)}")

        finally:
            if cursor:
                cursor.close()
            if connection:
                connection.close()
                
    def delete_logbook_entries(self, id: int) -> None:
        """Delete all logbook entries for a specific person"""
        query = "DELETE FROM diario WHERE id = %s"
        
        connection = None
        cursor = None
        
        try:
            connection = db_config.get_connection()
            cursor = connection.cursor()
            cursor.execute(query, (id,))
            connection.commit()

        except Exception as e:
            if connection:
                connection.rollback()
            raise Exception(f"Error deleting logbook entries: {str(e)}")

        finally:
            if cursor:
                cursor.close()
            if connection:
                connection.close()

logbook_dao = LogbookDAO()