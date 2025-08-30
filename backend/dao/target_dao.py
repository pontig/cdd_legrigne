"""
Data Access Object for Targeted activities
"""

from typing import List
from flask import session
from config.database import db_config

class TargetDAO:
    """Data Access Object for Targeted activities"""
    
    def get_target_entries(self, person_id: int) -> List[dict]:
        """Get target entries for a specific person"""
        semester_constraint = " = %s" if session.get('semester') is not None else " IS NULL"
        query = f"""
            SELECT attivita_mirata.*, account.nome, account.cognome FROM attivita_mirata
            JOIN account ON attivita_mirata.firma = account.id
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
            
            target_entries = []
            for row in results:
                target_entries.append({
                    'id': row[0],
                    'person_id': row[1],
                    'date': str(row[4]) + '-' + str(row[3]).zfill(2) + '-' + str(row[2]).zfill(2),
                    'event': row[5],
                    'intervention': row[6],
                    'signature': f"{row[9]} {row[10]}",
                })
            return target_entries
        
        except Exception as e:
            if connection:
                connection.rollback()
            
            return str(e)
        
        finally:
            if cursor:
                cursor.close()
            if connection:
                connection.close()
                
    def create_target_entry(self, data: dict) -> None:
        """Create a new target entry"""
        query = """
            INSERT INTO attivita_mirata VALUES (NULL, %s, %s, %s, %s, %s, %s, %s, NULL)
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
                session.get('user_id')
            ))
            connection.commit()

        except Exception as e:
            if connection:
                connection.rollback()
            raise Exception(f"Error creating target entry: {str(e)}")

        finally:
            if cursor:
                cursor.close()
            if connection:
                connection.close()
                
    def delete_target_entries(self, id: int) -> None:
        """Delete a target entry by ID"""
        query = "DELETE FROM attivita_mirata WHERE id = %s"
        
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
            raise Exception(f"Error deleting target entries: {str(e)}")

        finally:
            if cursor:
                cursor.close()
            if connection:
                connection.close()

target_dao = TargetDAO()